create table agencies (
  id text primary key,
  name text not null,
  slug text not null unique,
  logo text not null,
  description text not null,
  department text not null,
  municipality text not null,
  phone text not null,
  whatsapp text not null,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'suspended')),
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp
);

create table platform_admins (
  user_id text primary key references "user" (id) on delete cascade,
  created_at timestamptz not null default current_timestamp
);

create table agency_members (
  agency_id text not null references agencies (id) on delete cascade,
  user_id text not null references "user" (id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default current_timestamp,
  primary key (agency_id, user_id)
);

create index agency_members_user_id_idx on agency_members (user_id);

create table properties (
  id text primary key,
  agency_id text not null references agencies (id) on delete restrict,
  slug text not null unique,
  title text not null,
  description text not null,
  price bigint not null check (price >= 0),
  currency text not null default 'COP' check (currency = 'COP'),
  property_type text not null
    check (property_type in ('lote', 'finca', 'terreno-rural', 'terreno-urbano')),
  department text not null,
  municipality text not null,
  address text,
  area numeric(14, 2) not null check (area > 0),
  area_unit text not null check (area_unit in ('m2', 'hectareas')),
  intended_use text[] not null default '{}',
  services text[] not null default '{}',
  road_access text not null,
  featured boolean not null default false,
  negotiable boolean not null default false,
  image_alt text not null,
  highlights text[] not null default '{}',
  legal_info text[] not null default '{}',
  latitude double precision,
  longitude double precision,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  check (
    (status = 'rejected' and rejection_reason is not null)
    or status <> 'rejected'
  )
);

create index properties_agency_id_idx on properties (agency_id);
create index properties_public_idx
  on properties (published_at desc)
  where status = 'published';

create table property_media (
  id text primary key,
  property_id text not null references properties (id) on delete cascade,
  variant text not null check (variant in ('display', 'thumbnail')),
  position integer not null check (position >= 0),
  mime_type text not null check (mime_type = 'image/webp'),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  byte_size integer not null check (byte_size > 0),
  sha256 char(64) not null,
  content bytea not null,
  created_at timestamptz not null default current_timestamp,
  unique (property_id, position, variant),
  check (octet_length(content) = byte_size)
);

create index property_media_property_id_idx
  on property_media (property_id, position, variant);

create table audit_events (
  id text primary key,
  actor_user_id text references "user" (id) on delete set null,
  agency_id text references agencies (id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default current_timestamp
);

create index audit_events_entity_idx
  on audit_events (entity_type, entity_id, created_at desc);
create index audit_events_agency_idx
  on audit_events (agency_id, created_at desc);

create or replace function prevent_audit_event_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_events is append-only';
end;
$$;

create trigger audit_events_no_update
before update or delete on audit_events
for each row execute function prevent_audit_event_mutation();
