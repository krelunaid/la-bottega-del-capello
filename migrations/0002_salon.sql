create table if not exists stylists (
  id text primary key,
  name text not null,
  role text not null,
  bio text not null,
  instagram text,
  initials text not null,
  sort int not null default 0,
  active boolean not null default true
);

create table if not exists services (
  id text primary key,
  name text not null,
  description text not null default '',
  price_cents int not null,
  duration_min int not null check (duration_min in (30, 60)),
  category text not null check (category in ('hair', 'beard', 'addon', 'treatment')),
  is_primary boolean not null default true,
  is_addon boolean not null default false,
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists appointments (
  id text primary key,
  stylist_id text not null references stylists(id),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  notes text,
  appt_date date not null,
  start_min int not null,
  duration_min int not null check (duration_min in (30, 60)),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'done')),
  user_id text,
  code text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists appointments_stylist_date_idx
  on appointments (stylist_id, appt_date, status);

create table if not exists appointment_services (
  appointment_id text not null references appointments(id) on delete cascade,
  service_id text not null,
  service_name text not null,
  price_cents int not null,
  duration_min int not null,
  primary key (appointment_id, service_id)
);

insert into stylists (id, name, role, bio, instagram, initials, sort) values
  (
    'mario',
    'Mario Bassetti',
    'Master Barber',
    'Barbiere dal 1977. Oltre 45 anni di mestiere, campionati provinciali, italiani e mondiali. La mano che ha formato la Bottega.',
    'mariobassetti',
    'MB',
    1
  ),
  (
    'stefano',
    'Stefano Pierini',
    'Senior Stylist',
    'Linee pulite, proporzioni sartoriali. Stefano costruisce il taglio intorno al viso e al modo in cui lo porti.',
    'pierinistefano',
    'SP',
    2
  ),
  (
    'simone',
    'Simone Capocchi',
    'Creative Stylist',
    'Sfumature, texture e look contemporanei. Il punto d''incontro tra tradizione della bottega e stile di oggi.',
    'simone_capocchi',
    'SC',
    3
  ),
  (
    'daniele',
    'Daniele Lera',
    'Beard Expert',
    'Barba, contorni e rasatura di precisione. Il dettaglio che chiude il ritratto.',
    'danielelera_',
    'DL',
    4
  )
on conflict (id) do nothing;

insert into services (id, name, description, price_cents, duration_min, category, is_primary, is_addon, sort) values
  ('shampoo', 'Shampoo', 'Lavaggio rigenerante con prodotti premium e massaggio del cuoio capelluto.', 800, 30, 'hair', true, false, 1),
  ('shampoo-taglio', 'Shampoo + Taglio', 'Lavaggio e taglio sartoriale studiato sulla forma del viso.', 2200, 60, 'hair', true, false, 2),
  ('taglio-bambino', 'Taglio bambino', 'Taglio dedicato ai più piccoli, con calma e precisione.', 1500, 30, 'hair', true, false, 3),
  ('taglio-tosatrice', 'Taglio tosatrice', 'Taglio con tosatrice, linee nette e manutenzione veloce.', 1500, 30, 'hair', true, false, 4),
  ('sfumatura-tosatrice', 'Sfumatura con tosatrice', 'Fade e sfumature progressive, dal skin fade al classico.', 2000, 30, 'hair', true, false, 5),
  ('shampoo-acconciatura', 'Shampoo e acconciatura', 'Lavaggio e piega / finish professionale con prodotti di alta gamma.', 2500, 60, 'hair', true, false, 6),
  ('barba', 'Regolazione barba', 'Contorni definiti, lunghezza e forma. Il complemento naturale al taglio.', 1200, 30, 'beard', false, true, 10),
  ('barba-nera', 'Barba nera', 'Copertura e tinta barba per un nero pieno e uniforme.', 1500, 30, 'beard', false, true, 11),
  ('barba-rasoio', 'Barba con rasoio', 'Rifinitura al rasoio, contorni netti e pelle curata.', 1600, 30, 'beard', false, true, 12),
  ('contorno', 'Contorno barba e baffi', 'Solo il segno: basette, collo e linea baffi.', 800, 30, 'beard', false, true, 13),
  ('trattamento', 'Trattamento cuoio capelluto', 'Impacco e massaggio per cuoio capelluto e fibra.', 1000, 30, 'treatment', false, true, 14)
on conflict (id) do nothing;

-- Seed a few bookings on the next open salon day so the agenda feels alive.
insert into appointments (
  id, stylist_id, customer_name, customer_phone, customer_email, notes,
  appt_date, start_min, duration_min, status, user_id, code
)
select
  v.id, v.stylist_id, v.customer_name, v.customer_phone, null, null,
  (
    case extract(dow from current_date)
      when 0 then current_date + 2
      when 1 then current_date + 1
      else current_date
    end
  )::date,
  v.start_min, v.duration_min, 'confirmed', null, v.code
from (
  values
    ('seed-1', 'stefano', 'Luca Bianchi', '3331112233', 570, 30, 'BT-SEED1'),
    ('seed-2', 'stefano', 'Marco Rossi', '3332223344', 630, 60, 'BT-SEED2'),
    ('seed-3', 'mario', 'Paolo Neri', '3333334455', 540, 60, 'BT-SEED3'),
    ('seed-4', 'simone', 'Andrea Galli', '3334445566', 960, 30, 'BT-SEED4'),
    ('seed-5', 'daniele', 'Giorgio Fontana', '3335556677', 990, 30, 'BT-SEED5')
) as v(id, stylist_id, customer_name, customer_phone, start_min, duration_min, code)
on conflict (id) do nothing;

insert into appointment_services (appointment_id, service_id, service_name, price_cents, duration_min)
values
  ('seed-1', 'sfumatura-tosatrice', 'Sfumatura con tosatrice', 2000, 30),
  ('seed-2', 'shampoo-taglio', 'Shampoo + Taglio', 2200, 60),
  ('seed-3', 'shampoo-taglio', 'Shampoo + Taglio', 2200, 60),
  ('seed-3', 'barba', 'Regolazione barba', 1200, 30),
  ('seed-4', 'taglio-tosatrice', 'Taglio tosatrice', 1500, 30),
  ('seed-5', 'barba-rasoio', 'Barba con rasoio', 1600, 30)
on conflict do nothing;
