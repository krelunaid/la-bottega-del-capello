export const SALON = {
  name: "La Bottega del Capello",
  tagline: "Eleganza. Precisione. Stile.",
  phone: "392 375 3847",
  phoneHref: "tel:+393923753847",
  whatsappHref: "https://wa.me/393923753847",
  address: "Via Romana Vecchia, 36",
  city: "51013 Chiesanuova (PT)",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Via+Romana+Vecchia+36+Chiesanuova+PT",
  facebook: "https://www.facebook.com/labottegadelcapello2025",
  instagram: "https://www.instagram.com/_la_bottega_del_capello/",
  hoursLabel: "Mar–Ven 8:30–13:00 / 15:30–20:00 · Sab 8:00–19:00",
} as const;

export const SALON_TZ = "Europe/Rome";

export type ServiceCategory = "hair" | "beard" | "addon" | "treatment";

export type Stylist = {
  id: string;
  name: string;
  role: string;
  bio: string;
  instagram: string | null;
  initials: string;
  photo_url: string | null;
  sort: number;
  active: boolean;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  duration_min: 30 | 60;
  category: ServiceCategory;
  is_primary: boolean;
  is_addon: boolean;
  active: boolean;
  sort: number;
};

export type AppointmentStatus = "confirmed" | "cancelled" | "done";

export type Occupancy = {
  start_min: number;
  duration_min: number;
};

export type AppointmentService = {
  appointment_id: string;
  service_id: string;
  service_name: string;
  price_cents: number;
  duration_min: number;
};

export type AppointmentDetail = {
  id: string;
  stylist_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  appt_date: string;
  start_min: number;
  duration_min: 30 | 60;
  status: AppointmentStatus;
  user_id: string | null;
  code: string;
  created_at: string;
  stylist_name: string;
  stylist_initials: string;
  services: AppointmentService[];
  total_cents: number;
};

export function stylistPhoto(s: Pick<Stylist, "id" | "photo_url">): string {
  return s.photo_url || `/images/team/${s.id}.jpg`;
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function todayInRome(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, computed on the calendar date. */
function dowUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isOpenDay(iso: string): boolean {
  const dow = dowUtc(iso);
  return dow !== 0 && dow !== 1;
}

function openWindows(iso: string): Array<[number, number]> {
  const dow = dowUtc(iso);
  if (dow === 0 || dow === 1) return [];
  if (dow === 6) return [[8 * 60, 19 * 60]];
  return [
    [8 * 60 + 30, 13 * 60],
    [15 * 60 + 30, 20 * 60],
  ];
}

export function combinedDuration(services: { duration_min: number }[]): 30 | 60 {
  if (services.length === 0) return 30;
  if (services.length > 1) return 60;
  return services[0].duration_min >= 60 ? 60 : 30;
}

function overlaps(aStart: number, aDur: number, bStart: number, bDur: number): boolean {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

export function availableSlots(
  iso: string,
  duration: 30 | 60,
  occupied: Occupancy[],
): number[] {
  const slots: number[] = [];
  for (const [from, to] of openWindows(iso)) {
    for (let t = from; t + duration <= to; t += 30) {
      const busy = occupied.some((o) => overlaps(t, duration, o.start_min, o.duration_min));
      if (!busy) slots.push(t);
    }
  }
  return slots;
}

export function monthGrid(year: number, monthIndex: number): Array<string | null> {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const startPad = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: Array<string | null> = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let d = 1; d <= days; d += 1) {
    const iso = new Date(Date.UTC(year, monthIndex, d)).toISOString().slice(0, 10);
    cells.push(iso);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
