-- -----------------------------------------------------------------------------
-- Fix User Deletion (Add Cascade Delete)
-- -----------------------------------------------------------------------------
-- This script updates foreign key constraints to allow deleting a user from auth.users
-- to automatically delete all their associated data (profiles, posts, etc.).

-- Run this in the Supabase SQL Editor.

BEGIN;

-- 1. PROFILES -> AUTH.USERS
-- Drop existing constraint (name is usually profiles_id_fkey or auto-generated)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'profiles' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
-- Re-add with CASCADE
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- 2. FOLLOWS
-- follower_id -> profiles(id)
-- following_id -> profiles(id)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'follows' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE follows DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
ALTER TABLE follows ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE follows ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE;


-- 3. SERVICES
-- photographer_id -> profiles(id)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'services' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE services DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
ALTER TABLE services ADD CONSTRAINT services_photographer_id_fkey FOREIGN KEY (photographer_id) REFERENCES profiles(id) ON DELETE CASCADE;


-- 4. PORTFOLIO ITEMS
-- photographer_id -> profiles(id)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'portfolio_items' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE portfolio_items DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
ALTER TABLE portfolio_items ADD CONSTRAINT portfolio_items_photographer_id_fkey FOREIGN KEY (photographer_id) REFERENCES profiles(id) ON DELETE CASCADE;


-- 5. BOOKINGS
-- customer_id -> profiles(id)
-- photographer_id -> profiles(id)
-- service_id -> services(id) (Optional but good to clean up if service deleted)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'bookings' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
ALTER TABLE bookings ADD CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_photographer_id_fkey FOREIGN KEY (photographer_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL; -- Or cascade, but set null preserves history if we wanted, tho cascade is fine too. Let's do SET NULL for service deletion, but CASCADE for user deletion (via customer/photographer columns)


-- 6. AVAILABILITY
-- photographer_id -> profiles(id)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'availability' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE availability DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
ALTER TABLE availability ADD CONSTRAINT availability_photographer_id_fkey FOREIGN KEY (photographer_id) REFERENCES profiles(id) ON DELETE CASCADE;


-- 7. LIKES (Post Likes)
-- user_id -> profiles(id)
-- post_id -> posts(id) (Already cascade in schema, but good to ensure)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'likes' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE likes DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;


-- 8. COMMENT LIKES
-- user_id -> profiles(id)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'comment_likes' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE comment_likes DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
ALTER TABLE comment_likes ADD CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE comment_likes ADD CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;


-- 9. REVIEWS
-- bookings_id -> bookings(id)
-- photographer_id -> profiles(id)
-- customer_id -> profiles(id)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'reviews' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE reviews DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_photographer_id_fkey FOREIGN KEY (photographer_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;


-- 10. MESSAGES
-- sender_id -> profiles(id)
-- receiver_id -> profiles(id)
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'messages' AND constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE messages DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
    END LOOP;
END $$;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

COMMIT;
