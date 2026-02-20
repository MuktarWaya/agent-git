-- Enable Row Level Security (RLS)
alter table auth.users enable row level security;

-- Create units table
create table units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  cover_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  role text check (role in ('super_admin', 'unit_admin', 'public')) default 'public',
  unit_id uuid references units(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create posts table
create table posts (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid references units(id) not null,
  title text not null,
  content text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on tables
alter table units enable row level security;
alter table public.users enable row level security;
alter table posts enable row level security;

-- Policies for units
create policy "Public units are viewable by everyone."
  on units for select
  using ( true );

create policy "Super Admins can insert units."
  on units for insert
  with check ( exists ( select 1 from public.users where id = auth.uid() and role = 'super_admin' ) );

create policy "Super Admins can update units."
  on units for update
  using ( exists ( select 1 from public.users where id = auth.uid() and role = 'super_admin' ) );

-- Policies for users
create policy "Public users are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can update their own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Policies for posts
create policy "Public posts are viewable by everyone."
  on posts for select
  using ( true );

create policy "Unit Admins can insert posts for their unit."
  on posts for insert
  with check ( 
    exists ( 
      select 1 from public.users 
      where id = auth.uid() 
      and role = 'unit_admin' 
      and unit_id = posts.unit_id 
    ) 
  );

create policy "Unit Admins can update their unit's posts."
  on posts for update
  using ( 
    exists ( 
      select 1 from public.users 
      where id = auth.uid() 
      and role = 'unit_admin' 
      and unit_id = posts.unit_id 
    ) 
  );

create policy "Unit Admins can delete their unit's posts."
  on posts for delete
  using ( 
    exists ( 
      select 1 from public.users 
      where id = auth.uid() 
      and role = 'unit_admin' 
      and unit_id = posts.unit_id 
    ) 
  );
