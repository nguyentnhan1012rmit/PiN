-- 1. Create Notifications Table
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null, -- 'booking_request', 'booking_update', 'new_review', 'new_message', 'system'
  title text not null,
  message text,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS
alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  using ( auth.uid() = user_id );

create policy "Users can update their own notifications"
  on notifications for update
  using ( auth.uid() = user_id );

-- 3. Triggers

-- Trigger 1: New Booking Request (Notify Photographer)
create or replace function notify_on_new_booking()
returns trigger as $$
declare
  customer_name text;
begin
  select full_name into customer_name from profiles where id = new.customer_id;
  
  insert into notifications (user_id, type, title, message, link)
  values (
    new.photographer_id,
    'booking_request',
    'New Booking Request',
    coalesce(customer_name, 'Someone') || ' has requested a booking.',
    '/dashboard'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication errors during re-runs
drop trigger if exists on_booking_created on bookings;
create trigger on_booking_created
  after insert on bookings
  for each row execute procedure notify_on_new_booking();


-- Trigger 2: Booking Status Change (Notify Customer)
create or replace function notify_on_booking_status_change()
returns trigger as $$
declare
  photographer_name text;
begin
  if (old.status is distinct from new.status) then
      select full_name into photographer_name from profiles where id = new.photographer_id;

      insert into notifications (user_id, type, title, message, link)
      values (
        new.customer_id,
        'booking_update',
        'Booking ' || initcap(new.status),
        'Your booking with ' || coalesce(photographer_name, 'the photographer') || ' is now ' || new.status || '.',
        '/my-bookings'
      );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_booking_updated on bookings;
create trigger on_booking_updated
  after update on bookings
  for each row execute procedure notify_on_booking_status_change();


-- Trigger 3: New Review (Notify Photographer)
create or replace function notify_on_new_review()
returns trigger as $$
declare
  reviewer_name text;
begin
  select full_name into reviewer_name from profiles where id = new.customer_id;

  insert into notifications (user_id, type, title, message, link)
  values (
    new.photographer_id,
    'new_review',
    'New Review Received',
    coalesce(reviewer_name, 'A client') || ' left you a ' || new.rating || '-star review.',
    '/photographer/' || new.photographer_id
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_review_created on reviews;
create trigger on_review_created
  after insert on reviews
  for each row execute procedure notify_on_new_review();
