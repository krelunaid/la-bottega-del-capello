alter table stylists add column if not exists photo_url text;

create table if not exists salon_settings (
  key text primary key,
  value text not null
);
