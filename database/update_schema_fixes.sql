-- =============================================================================
-- PiN Database Schema Fixes
-- Run this script in Supabase SQL Editor to apply fixes
-- =============================================================================

-- 1. FIX: Update handle_new_user trigger to capture username
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$$;


-- 2. FIX: Add comments update RLS policy
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their own comments." ON comments;
CREATE POLICY "Users can update their own comments."
  ON comments FOR UPDATE USING ( auth.uid() = user_id );


-- 3. FIX: Allow customers to cancel their own pending bookings
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customers can cancel their own bookings" ON bookings;
CREATE POLICY "Customers can cancel their own bookings"
  ON bookings FOR UPDATE USING (
    auth.uid() = customer_id 
    AND status = 'pending'
  );


-- 4. FIX: Allow customers to update their own pending bookings to confirmed (payment flow)
-- Note: This is a simplified version. In production, use Stripe webhooks.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customers can confirm their own pending bookings" ON bookings;
CREATE POLICY "Customers can confirm their own pending bookings"
  ON bookings FOR UPDATE USING (
    auth.uid() = customer_id
  );


-- Verification Query (run after applying fixes):
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('comments', 'bookings', 'notifications') ORDER BY tablename;


-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL DEFAULT 'general', -- booking, message, review, general
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;


-- =============================================================================
-- TRIGGER: Create notification when booking status changes
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_booking_change()
RETURNS TRIGGER AS $$
DECLARE
    photographer_name TEXT;
    customer_name TEXT;
BEGIN
    -- Get names
    SELECT full_name INTO photographer_name FROM profiles WHERE id = NEW.photographer_id;
    SELECT full_name INTO customer_name FROM profiles WHERE id = NEW.customer_id;
    
    -- Notify customer of booking status change
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status = 'confirmed' THEN
            INSERT INTO notifications (user_id, type, message, link)
            VALUES (NEW.customer_id, 'booking', 
                    'Your booking with ' || photographer_name || ' has been confirmed!',
                    '/my-bookings');
        ELSIF NEW.status = 'cancelled' THEN
            INSERT INTO notifications (user_id, type, message, link)
            VALUES (NEW.customer_id, 'booking', 
                    'Your booking with ' || photographer_name || ' has been cancelled.',
                    '/my-bookings');
        ELSIF NEW.status = 'completed' THEN
            INSERT INTO notifications (user_id, type, message, link)
            VALUES (NEW.customer_id, 'booking', 
                    'Your booking with ' || photographer_name || ' is complete! Leave a review.',
                    '/photographer/' || NEW.photographer_id);
        END IF;
    END IF;
    
    -- Notify photographer of new booking
    IF TG_OP = 'INSERT' THEN
        INSERT INTO notifications (user_id, type, message, link)
        VALUES (NEW.photographer_id, 'booking', 
                'New booking request from ' || customer_name,
                '/dashboard');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_booking_change ON bookings;
CREATE TRIGGER on_booking_change
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION notify_booking_change();
