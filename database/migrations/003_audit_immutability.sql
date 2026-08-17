alter table audit_events
  drop constraint audit_events_actor_user_id_fkey,
  drop constraint audit_events_agency_id_fkey;

comment on column audit_events.actor_user_id is
  'Identificador histórico; no usa FK para preservar auditoría inmutable.';

comment on column audit_events.agency_id is
  'Identificador histórico; no usa FK para preservar auditoría inmutable.';
