create table if not exists staff_members (
  user_id text primary key,
  name text not null,
  stylist_id text,
  created_at timestamptz not null default now()
);

insert into salon_settings (key, value)
values ('staff_pin', 'BOTTEGA')
on conflict (key) do nothing;
