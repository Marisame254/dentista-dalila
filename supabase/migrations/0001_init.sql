-- Citas, mensajes y bloqueos de horario para el panel de la dentista.
-- Ejecutar una sola vez en Supabase: SQL Editor > New query > pegar > Run.

-- ---------------------------------------------------------------------------
-- Quién puede entrar al panel
-- ---------------------------------------------------------------------------
-- Solo los usuarios listados aquí pueden leer o modificar datos, aunque
-- alguien más lograra crear una cuenta en el proyecto.
create table public.panel_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.panel_users enable row level security;

create policy "panel_users: ver mi propio registro"
  on public.panel_users for select
  to authenticated
  using (user_id = (select auth.uid()));

create function public.is_panel_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.panel_users where user_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- Citas
-- ---------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  patient_name text not null check (char_length(patient_name) between 2 and 80),
  patient_phone text not null check (patient_phone ~ '^[0-9]{10,15}$'),
  patient_email text,
  service text not null check (char_length(service) between 2 and 80),
  starts_at timestamptz not null,
  duration_min integer not null default 60 check (duration_min between 10 and 480),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  patient_note text check (char_length(patient_note) <= 500),
  admin_note text check (char_length(admin_note) <= 2000),
  source text not null default 'web' check (source in ('web', 'panel'))
);

-- Un mismo horario no puede tener dos citas activas (evita la doble reserva
-- aunque dos pacientes envíen la solicitud al mismo tiempo).
create unique index appointments_active_slot
  on public.appointments (starts_at)
  where status in ('pending', 'confirmed');

create index appointments_starts_at on public.appointments (starts_at);
create index appointments_phone on public.appointments (patient_phone);

alter table public.appointments enable row level security;

create policy "appointments: solo panel"
  on public.appointments for all
  to authenticated
  using ((select public.is_panel_user()))
  with check ((select public.is_panel_user()));

-- ---------------------------------------------------------------------------
-- Mensajes de pacientes
-- ---------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (phone ~ '^[0-9]{10,15}$'),
  body text not null check (char_length(body) between 1 and 1000),
  appointment_id uuid references public.appointments (id) on delete set null,
  read_at timestamptz,
  archived boolean not null default false
);

create index messages_created_at on public.messages (created_at desc);
create index messages_phone on public.messages (phone);

alter table public.messages enable row level security;

create policy "messages: solo panel"
  on public.messages for all
  to authenticated
  using ((select public.is_panel_user()))
  with check ((select public.is_panel_user()));

-- ---------------------------------------------------------------------------
-- Horarios bloqueados (vacaciones, comida, días festivos)
-- ---------------------------------------------------------------------------
create table public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text check (char_length(reason) <= 200),
  check (ends_at > starts_at)
);

create index blocked_times_range on public.blocked_times (starts_at, ends_at);

alter table public.blocked_times enable row level security;

create policy "blocked_times: solo panel"
  on public.blocked_times for all
  to authenticated
  using ((select public.is_panel_user()))
  with check ((select public.is_panel_user()));

-- ---------------------------------------------------------------------------
-- Después de crear el usuario de la dentista en Authentication > Users,
-- darle acceso al panel (cambiar el correo):
--
--   insert into public.panel_users (user_id)
--   select id from auth.users where email = 'correo-de-la-dentista@ejemplo.com';
-- ---------------------------------------------------------------------------
