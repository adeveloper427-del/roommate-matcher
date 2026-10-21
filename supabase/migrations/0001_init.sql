-- Roommate Matcher — initial schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).

-- =========================================================================
-- PROFILES (one row per auth.users row, for every role)
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('user', 'organization', 'admin')),
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-create a profiles row whenever someone signs up.
-- Expects role/full_name passed as auth signUp options.data.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'full_name', 'New User')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- USER DETAILS (extended fields for role = 'user')
-- =========================================================================
create table public.user_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  profile_picture_url text,
  age int,
  university text,
  course text,
  year_of_study int,
  location text,
  budget_min int,
  budget_max int,
  preferred_location text,
  room_type_preference text check (room_type_preference in ('single', 'shared_double', 'shared_triple', 'dormitory')),
  roommates_wanted int,
  bio text,
  profile_completed boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_details enable row level security;

create policy "User details are viewable by authenticated users"
  on public.user_details for select
  to authenticated
  using (true);

create policy "Users can upsert their own details"
  on public.user_details for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own details"
  on public.user_details for update
  to authenticated
  using (auth.uid() = user_id);

-- =========================================================================
-- LIFESTYLE PREFERENCES
-- =========================================================================
create table public.lifestyle_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  sleep_schedule text check (sleep_schedule in ('early_bird', 'flexible', 'night_owl')),
  cleanliness text check (cleanliness in ('very_tidy', 'moderate', 'relaxed')),
  noise_tolerance text check (noise_tolerance in ('low', 'medium', 'high')),
  study_habits text check (study_habits in ('quiet_focus', 'background_noise_ok', 'group_study')),
  smoking text check (smoking in ('non_smoker', 'occasional', 'smoker')),
  pets text check (pets in ('no_pets', 'okay_with_pets', 'has_pets')),
  cooking text check (cooking in ('rarely', 'sometimes', 'daily')),
  social_lifestyle text check (social_lifestyle in ('introvert', 'balanced', 'extrovert')),
  guests text check (guests in ('rarely', 'occasionally', 'frequently')),
  personality text[] not null default '{}',
  hobbies text[] not null default '{}',
  other_preferences text,
  updated_at timestamptz not null default now()
);

alter table public.lifestyle_preferences enable row level security;

create policy "Lifestyle preferences are viewable by authenticated users"
  on public.lifestyle_preferences for select
  to authenticated
  using (true);

create policy "Users can upsert their own lifestyle preferences"
  on public.lifestyle_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own lifestyle preferences"
  on public.lifestyle_preferences for update
  to authenticated
  using (auth.uid() = user_id);

-- =========================================================================
-- ORGANIZATIONS
-- =========================================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('hostel', 'university', 'apartment_provider', 'property_manager', 'private')),
  logo_url text,
  contact_email text not null,
  contact_phone text,
  location text not null,
  description text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

create policy "Organizations are publicly viewable"
  on public.organizations for select
  using (true);

create policy "Owners manage their organization"
  on public.organizations for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- =========================================================================
-- PROPERTIES
-- =========================================================================
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text not null,
  location text not null,
  address text,
  images text[] not null default '{}',
  amenities text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  total_rooms int not null default 0,
  available_rooms int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;

create policy "Properties are publicly viewable"
  on public.properties for select
  using (true);

create policy "Organization owners manage their properties"
  on public.properties for all
  to authenticated
  using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
  with check (organization_id in (select id from public.organizations where owner_id = auth.uid()));

-- =========================================================================
-- ROOMS
-- =========================================================================
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  room_type text not null check (room_type in ('single', 'shared_double', 'shared_triple', 'dormitory')),
  price_per_month numeric(10,2) not null,
  currency text not null default 'KSh',
  capacity int not null,
  available_spaces int not null,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  status text not null check (status in ('available', 'almost_full', 'full', 'maintenance')),
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

create policy "Rooms are publicly viewable"
  on public.rooms for select
  using (true);

create policy "Organization owners manage their rooms"
  on public.rooms for all
  to authenticated
  using (
    property_id in (
      select p.id from public.properties p
      join public.organizations o on o.id = p.organization_id
      where o.owner_id = auth.uid()
    )
  )
  with check (
    property_id in (
      select p.id from public.properties p
      join public.organizations o on o.id = p.organization_id
      where o.owner_id = auth.uid()
    )
  );

-- =========================================================================
-- BOOKINGS
-- =========================================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  move_in_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "Users view their own bookings"
  on public.bookings for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Organization owners view bookings on their properties"
  on public.bookings for select
  to authenticated
  using (
    property_id in (
      select p.id from public.properties p
      join public.organizations o on o.id = p.organization_id
      where o.owner_id = auth.uid()
    )
  );

create policy "Users create their own bookings"
  on public.bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Organization owners update booking status"
  on public.bookings for update
  to authenticated
  using (
    property_id in (
      select p.id from public.properties p
      join public.organizations o on o.id = p.organization_id
      where o.owner_id = auth.uid()
    )
  );

-- =========================================================================
-- CONNECTIONS
-- =========================================================================
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (from_user_id, to_user_id)
);

alter table public.connections enable row level security;

create policy "Users view their own connections"
  on public.connections for select
  to authenticated
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users create outgoing connection requests"
  on public.connections for insert
  to authenticated
  with check (auth.uid() = from_user_id);

create policy "Recipients respond to connection requests"
  on public.connections for update
  to authenticated
  using (auth.uid() = to_user_id or auth.uid() = from_user_id);

-- =========================================================================
-- CONVERSATIONS + PARTICIPANTS + MESSAGES
-- =========================================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "Participants view their conversations"
  on public.conversations for select
  to authenticated
  using (id in (select conversation_id from public.conversation_participants where user_id = auth.uid()));

create policy "Authenticated users can start conversations"
  on public.conversations for insert
  to authenticated
  with check (true);

create policy "Participants view participant rows for their conversations"
  on public.conversation_participants for select
  to authenticated
  using (conversation_id in (select conversation_id from public.conversation_participants where user_id = auth.uid()));

create policy "Users add themselves or others when starting a conversation"
  on public.conversation_participants for insert
  to authenticated
  with check (true);

create policy "Participants view messages in their conversations"
  on public.messages for select
  to authenticated
  using (conversation_id in (select conversation_id from public.conversation_participants where user_id = auth.uid()));

create policy "Participants send messages in their conversations"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and conversation_id in (select conversation_id from public.conversation_participants where user_id = auth.uid())
  );

create policy "Participants mark messages read"
  on public.messages for update
  to authenticated
  using (conversation_id in (select conversation_id from public.conversation_participants where user_id = auth.uid()));

-- =========================================================================
-- NOTIFICATIONS
-- =========================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('match', 'booking', 'message', 'connection', 'system')),
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users view their own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users update their own notifications"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id);

-- =========================================================================
-- REVIEWS
-- =========================================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are publicly viewable"
  on public.reviews for select
  using (true);

create policy "Authenticated users write their own reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = author_id);

-- =========================================================================
-- COMPATIBILITY SCORES
-- =========================================================================
create table public.compatibility_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  matched_user_id uuid not null references public.profiles(id) on delete cascade,
  compatibility_score int not null check (compatibility_score between 0 and 100),
  breakdown jsonb not null default '{}',
  strengths text[] not null default '{}',
  potential_conflicts text[] not null default '{}',
  recommendation text,
  created_at timestamptz not null default now(),
  unique (user_id, matched_user_id)
);

alter table public.compatibility_scores enable row level security;

create policy "Users view compatibility scores involving them"
  on public.compatibility_scores for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = matched_user_id);

-- Simple weighted compatibility function — computes and stores a score
-- between two users based on their lifestyle_preferences rows.
-- Call with: select public.calculate_compatibility('<user-uuid>', '<other-user-uuid>');
create function public.calculate_compatibility(p_user_id uuid, p_matched_user_id uuid)
returns public.compatibility_scores
language plpgsql
security definer set search_path = public
as $$
declare
  a public.lifestyle_preferences;
  b public.lifestyle_preferences;
  sleep_score int := 50;
  clean_score int := 50;
  noise_score int := 50;
  study_score int := 50;
  social_score int := 50;
  budget_score int := 70;
  location_score int := 70;
  total_score int;
  result public.compatibility_scores;
begin
  select * into a from public.lifestyle_preferences where user_id = p_user_id;
  select * into b from public.lifestyle_preferences where user_id = p_matched_user_id;

  if a.sleep_schedule is not null and a.sleep_schedule = b.sleep_schedule then sleep_score := 95;
  elsif a.sleep_schedule is not null and b.sleep_schedule is not null then sleep_score := 55;
  end if;

  if a.cleanliness is not null and a.cleanliness = b.cleanliness then clean_score := 95;
  elsif a.cleanliness is not null and b.cleanliness is not null then clean_score := 55;
  end if;

  if a.noise_tolerance is not null and a.noise_tolerance = b.noise_tolerance then noise_score := 90;
  elsif a.noise_tolerance is not null and b.noise_tolerance is not null then noise_score := 55;
  end if;

  if a.study_habits is not null and a.study_habits = b.study_habits then study_score := 92;
  elsif a.study_habits is not null and b.study_habits is not null then study_score := 55;
  end if;

  if a.social_lifestyle is not null and a.social_lifestyle = b.social_lifestyle then social_score := 85;
  elsif a.social_lifestyle is not null and b.social_lifestyle is not null then social_score := 55;
  end if;

  total_score := round(
    (sleep_score + clean_score + noise_score + study_score + social_score + budget_score + location_score) / 7.0
  );

  insert into public.compatibility_scores (
    user_id, matched_user_id, compatibility_score, breakdown, strengths, potential_conflicts, recommendation
  )
  values (
    p_user_id,
    p_matched_user_id,
    total_score,
    jsonb_build_object(
      'sleepSchedule', sleep_score,
      'cleanliness', clean_score,
      'noisePreference', noise_score,
      'studyHabits', study_score,
      'socialLifestyle', social_score,
      'budget', budget_score,
      'location', location_score
    ),
    array[]::text[],
    array[]::text[],
    case
      when total_score >= 85 then 'A strong match overall — your routines line up closely.'
      when total_score >= 60 then 'A workable match — worth discussing a few lifestyle differences.'
      else 'Lower compatibility — likely to need active communication on daily habits.'
    end
  )
  on conflict (user_id, matched_user_id) do update
    set compatibility_score = excluded.compatibility_score,
        breakdown = excluded.breakdown,
        recommendation = excluded.recommendation
  returning * into result;

  return result;
end;
$$;

-- =========================================================================
-- ADMIN OVERRIDES
-- Admins need to see/manage everything regardless of ownership.
-- =========================================================================
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "Admins view all bookings"
  on public.bookings for select
  to authenticated
  using (public.is_admin());

create policy "Admins update any booking"
  on public.bookings for update
  to authenticated
  using (public.is_admin());

create policy "Admins manage any organization"
  on public.organizations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage any property"
  on public.properties for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================================
-- STORAGE (avatars + property/room photos)
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Property images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "Organization owners upload property images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images');
