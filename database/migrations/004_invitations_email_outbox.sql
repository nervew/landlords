create table invitations (
  id text primary key,
  agency_id text not null references agencies (id) on delete cascade,
  email text not null check (email = lower(email)),
  role text not null check (role in ('owner', 'editor')),
  token_hash char(64) not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  invited_by_user_id text not null,
  accepted_by_user_id text,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  check (expires_at > created_at),
  check (
    (status = 'pending' and accepted_at is null and revoked_at is null)
    or (status = 'accepted' and accepted_at is not null and accepted_by_user_id is not null and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null and accepted_at is null)
  )
);

create unique index invitations_pending_agency_email_idx
  on invitations (agency_id, lower(email))
  where status = 'pending';

create index invitations_email_idx on invitations (lower(email), created_at desc);
create index invitations_agency_idx on invitations (agency_id, created_at desc);

create table email_outbox (
  id text primary key,
  kind text not null
    check (kind in ('invitation', 'password_reset', 'email_verification')),
  recipient text not null check (recipient = lower(recipient)),
  subject text not null,
  text_body text not null,
  html_body text not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'sent', 'failed', 'preview')),
  attempts integer not null default 0 check (attempts between 0 and 5),
  available_at timestamptz not null default current_timestamp,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  check (
    (status = 'sent' and sent_at is not null)
    or (status <> 'sent' and sent_at is null)
  )
);

create index email_outbox_dispatch_idx
  on email_outbox (available_at, created_at)
  where status in ('pending', 'failed');

create index email_outbox_recipient_idx
  on email_outbox (recipient, created_at desc);

