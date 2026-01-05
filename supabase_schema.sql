-- Enable PostGIS for location features (if available on your plan, otherwise we use float lat/long)
-- create extension if not exists postgis;

-- 1. PROFILES TABLE (Extends default auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  phone_number text,
  user_type text check (user_type in ('customer', 'driver')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 2. DRIVERS TABLE (Specific info for drivers)
create table public.drivers (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  vehicle_type text, -- '2 Wheeler', 'Truck', etc.
  vehicle_model text,
  license_plate text,
  is_online boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.drivers enable row level security;

create policy "Drivers are viewable by everyone." on public.drivers
  for select using (true);

create policy "Drivers can update their own status." on public.drivers
  for update using (auth.uid() = id);

create policy "Drivers can insert their own record." on public.drivers
  for insert with check (auth.uid() = id);

-- 3. RIDES TABLE (The core transaction)
create table public.rides (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) not null,
  driver_id uuid references public.drivers(id), -- Nullable until accepted
  pickup_latitude float not null,
  pickup_longitude float not null,
  drop_latitude float not null,
  drop_longitude float not null,
  pickup_address text,
  drop_address text,
  status text check (status in ('searching', 'accepted', 'arriving', 'in_transit', 'completed', 'cancelled')) default 'searching',
  price numeric,
  distance_km numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.rides enable row level security;

-- Policies for Rides
create policy "Users can see their own rides (customer or driver)." on public.rides
  for select using (auth.uid() = customer_id or auth.uid() = driver_id);

create policy "Customers can create rides." on public.rides
  for insert with check (auth.uid() = customer_id);

create policy "Drivers can update rides they accepted." on public.rides
  for update using (auth.uid() = driver_id or (driver_id is null and status = 'searching')); 

-- 4. DRIVER LOCATIONS (For Realtime Tracking - "NoSQL-like" speed)
create table public.driver_locations (
  driver_id uuid references public.drivers(id) on delete cascade not null primary key,
  latitude float not null,
  longitude float not null,
  heading float default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.driver_locations enable row level security;

create policy "Locations are viewable by everyone (or just authenticated)." on public.driver_locations
  for select using (true);

create policy "Drivers can insert their own location." on public.driver_locations
  for insert with check (auth.uid() = driver_id);

create policy "Drivers can update location." on public.driver_locations
  for update using (auth.uid() = driver_id);

-- 5. PAYMENTS TABLE
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  ride_id uuid references public.rides(id) not null,
  amount numeric not null,
  status text check (status in ('pending', 'completed', 'failed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;

create policy "Users can view their own payments." on public.payments
  for select using (
    exists (
      select 1 from public.rides
      where rides.id = payments.ride_id
      and (rides.customer_id = auth.uid() or rides.driver_id = auth.uid())
    )
  );

-- 6. FUNCTION TO HANDLE NEW USER SIGNUP (Trigger)
-- This automatically creates a profile entry when a user signs up via Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, user_type)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_type');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. ENABLE REALTIME
-- Add tables to the publication to enable listening to changes
alter publication supabase_realtime add table public.rides;
alter publication supabase_realtime add table public.driver_locations;
