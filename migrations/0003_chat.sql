create table if not exists conversations (
  id text primary key,
  user_id text,
  guest_name text not null,
  guest_phone text not null default '',
  last_body text,
  last_message_at timestamptz not null default now(),
  unread_staff int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists conversations_user_idx on conversations (user_id);
create index if not exists conversations_last_idx on conversations (last_message_at desc);

create table if not exists messages (
  id text primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  sender text not null check (sender in ('customer', 'shop')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conv_idx on messages (conversation_id, created_at);
