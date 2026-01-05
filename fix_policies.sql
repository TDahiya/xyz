-- Fix RLS policies for rides table
drop policy if exists "Users can see their own rides (customer or driver)." on public.rides;
drop policy if exists "Customers can create rides." on public.rides;
drop policy if exists "Drivers can update rides they accepted." on public.rides;

-- Allow users to see rides they created OR rides they are driving OR rides that are available (searching)
create policy "Users can see relevant rides" on public.rides
  for select using (
    auth.uid() = customer_id 
    or auth.uid() = driver_id 
    or (status = 'searching') -- Drivers need to see searching rides
  );

-- Allow customers to insert rides
create policy "Customers can create rides" on public.rides
  for insert with check (auth.uid() = customer_id);

-- Allow drivers to update rides (accept them)
create policy "Drivers can update rides" on public.rides
  for update using (
    auth.uid() = driver_id 
    or (driver_id is null and status = 'searching')
  );
