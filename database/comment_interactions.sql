-- Add likes_count to comments
alter table comments add column if not exists likes_count integer default 0;

-- Create table for comment likes
create table if not exists comment_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  comment_id uuid references comments(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, comment_id)
);

-- RLS for comment_likes
alter table comment_likes enable row level security;

create policy "Comment likes are viewable by everyone."
  on comment_likes for select
  using ( true );

create policy "Users can create comment likes."
  on comment_likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own comment likes."
  on comment_likes for delete
  using ( auth.uid() = user_id );

-- Function to update comment likes count
create or replace function update_comment_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update comments set likes_count = likes_count + 1 where id = new.comment_id;
  elsif (TG_OP = 'DELETE') then
    update comments set likes_count = likes_count - 1 where id = old.comment_id;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger for comment likes count
drop trigger if exists trigger_update_comment_likes_count on comment_likes;
create trigger trigger_update_comment_likes_count
after insert or delete on comment_likes
for each row execute procedure update_comment_likes_count();
