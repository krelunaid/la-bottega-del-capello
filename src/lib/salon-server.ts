import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSessionUser } from "@/lib/auth/verify.server";
import { assertStaff } from "@/lib/staff-server";
import {
  availableSlots,
  combinedDuration,
  todayInRome,
  addDaysIso,
  type AppointmentDetail,
  type AppointmentService,
  type AppointmentStatus,
  type Occupancy,
  type Service,
  type ServiceCategory,
  type Stylist,
} from "@/lib/salon";

const idSchema = z.string().min(1).max(80);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function newId(): string {
  return crypto.randomUUID();
}

function newCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  for (const b of bytes) body += alphabet[b % alphabet.length];
  return `BT-${body}`;
}

type ApptRow = {
  id: string;
  stylist_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  appt_date: string;
  start_min: number;
  duration_min: number;
  status: AppointmentStatus;
  user_id: string | null;
  code: string;
  created_at: string;
  stylist_name: string;
  stylist_initials: string;
};

async function hydrateAppointments(rows: ApptRow[]): Promise<AppointmentDetail[]> {
  if (rows.length === 0) return [];
  const sql = await getSql();
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
  const services = await sql.query<AppointmentService>(
    `select appointment_id, service_id, service_name, price_cents, duration_min
     from appointment_services where appointment_id in (${placeholders})`,
    ids,
  );
  const byAppt = new Map<string, AppointmentService[]>();
  for (const s of services) {
    const list = byAppt.get(s.appointment_id) ?? [];
    list.push(s);
    byAppt.set(s.appointment_id, list);
  }
  return rows.map((r) => {
    const svcs = byAppt.get(r.id) ?? [];
    return {
      ...r,
      duration_min: (r.duration_min === 60 ? 60 : 30) as 30 | 60,
      services: svcs,
      total_cents: svcs.reduce((sum, s) => sum + s.price_cents, 0),
    };
  });
}

let catalogCache: { at: number; stylists: Stylist[]; services: Service[] } | null = null;
const CATALOG_MS = 20_000;

async function loadCatalog() {
  const now = Date.now();
  if (catalogCache && now - catalogCache.at < CATALOG_MS) return catalogCache;
  const sql = await getSql();
  const [stylists, serviceRows] = await Promise.all([
    sql<Stylist>`
      select id, name, role, bio, instagram, initials, photo_url, sort, active
      from stylists where active = true order by sort
    `,
    sql<Service>`
      select id, name, description, price_cents, duration_min, category,
             is_primary, is_addon, active, sort
      from services where active = true order by sort, name
    `,
  ]);
  const slimStylists = stylists.map((s) => ({
    ...s,
    photo_url: s.photo_url && s.photo_url.startsWith("data:") ? null : s.photo_url,
  }));
  const services = serviceRows.map((r) => ({
    ...r,
    duration_min: (r.duration_min === 60 ? 60 : 30) as 30 | 60,
  }));
  catalogCache = { at: now, stylists: slimStylists, services };
  return catalogCache;
}

export function invalidateCatalog() {
  catalogCache = null;
}

export const listStylists = createServerFn({ method: "GET" }).handler(async () => {
  const catalog = await loadCatalog();
  return catalog.stylists;
});

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const catalog = await loadCatalog();
  return catalog.services;
});

export const listAllServicesAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    const rows = await sql<Service>`
      select id, name, description, price_cents, duration_min, category,
             is_primary, is_addon, active, sort
      from services order by sort, name
    `;
    return rows.map((r) => ({
      ...r,
      duration_min: (r.duration_min === 60 ? 60 : 30) as 30 | 60,
    }));
  });

export const getAvailability = createServerFn({ method: "GET" })
  .validator(
    z.object({
      stylistId: idSchema,
      date: dateSchema,
      duration: z.union([z.literal(30), z.literal(60)]),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const occupied = await sql<Occupancy>`
      select start_min, duration_min from appointments
      where stylist_id = ${data.stylistId}
        and appt_date = ${data.date}
        and status <> 'cancelled'
    `;
    return {
      occupied,
      slots: availableSlots(data.date, data.duration, occupied),
    };
  });

export const getDayAgenda = createServerFn({ method: "GET" })
  .validator(z.object({ date: dateSchema }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<ApptRow>`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where a.appt_date = ${data.date} and a.status <> 'cancelled'
      order by a.start_min, s.sort
    `;
    return hydrateAppointments(rows);
  });

const bookSchema = z.object({
  stylistId: idSchema,
  serviceIds: z.array(idSchema).min(1).max(8),
  date: dateSchema,
  startMin: z.number().int().min(0).max(24 * 60),
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z.string().trim().min(6).max(24),
  customerEmail: z.string().trim().max(120),
  notes: z.string().trim().max(400),
});

export const bookAppointment = createServerFn({ method: "POST" })
  .validator(bookSchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const stylists = await sql<{ id: string }>`
      select id from stylists where id = ${data.stylistId} and active = true
    `;
    if (stylists.length === 0) throw new Error("Barbiere non disponibile.");

    const placeholders = data.serviceIds.map((_, i) => `$${i + 1}`).join(", ");
    const services = await sql.query<Service>(
      `select id, name, description, price_cents, duration_min, category,
              is_primary, is_addon, active, sort
       from services where id in (${placeholders}) and active = true`,
      data.serviceIds,
    );
    if (services.length !== data.serviceIds.length) {
      throw new Error("Uno o più servizi non sono più disponibili.");
    }

    const duration = combinedDuration(services);
    const occupied = await sql<Occupancy>`
      select start_min, duration_min from appointments
      where stylist_id = ${data.stylistId}
        and appt_date = ${data.date}
        and status <> 'cancelled'
    `;
    const slots = availableSlots(data.date, duration, occupied);
    if (!slots.includes(data.startMin)) {
      throw new Error("Orario non più disponibile. Scegline un altro.");
    }

    const id = newId();
    const code = newCode();
    const emailRaw = data.customerEmail.trim();
    if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
      throw new Error("Email non valida.");
    }
    const email = emailRaw || null;
    const notes = data.notes.trim() || null;
    const session = await getSessionUser().catch(() => null);
    const userId = session?.id ?? null;

    await sql`
      insert into appointments (
        id, stylist_id, customer_name, customer_phone, customer_email, notes,
        appt_date, start_min, duration_min, status, user_id, code
      ) values (
        ${id}, ${data.stylistId}, ${data.customerName}, ${data.customerPhone},
        ${email}, ${notes}, ${data.date}, ${data.startMin}, ${duration},
        'confirmed', ${userId}, ${code}
      )
    `;

    for (const svc of services) {
      await sql`
        insert into appointment_services (
          appointment_id, service_id, service_name, price_cents, duration_min
        ) values (
          ${id}, ${svc.id}, ${svc.name}, ${svc.price_cents}, ${svc.duration_min}
        )
      `;
    }

    const rows = await sql<ApptRow>`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where a.id = ${id}
    `;
    const [detail] = await hydrateAppointments(rows);
    return detail;
  });

export const lookupAppointment = createServerFn({ method: "GET" })
  .validator(
    z.object({
      code: z.string().trim().min(3).max(16),
      phone: z.string().trim().min(6).max(24).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const code = data.code.trim().toUpperCase();
    const rows = await sql<ApptRow>`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where upper(a.code) = ${code}
    `;
    if (rows.length === 0) return null;
    const [detail] = await hydrateAppointments(rows);
    if (detail && data.phone) {
      const digits = data.phone.replace(/\D/g, "");
      const stored = detail.customer_phone.replace(/\D/g, "");
      if (digits && stored && !stored.endsWith(digits) && !digits.endsWith(stored)) {
        return null;
      }
    }
    const session = await getSessionUser().catch(() => null);
    if (session && detail && detail.status !== "cancelled" && !detail.user_id) {
      const sql2 = await getSql();
      await sql2`update appointments set user_id = ${session.id} where id = ${detail.id}`;
      detail.user_id = session.id;
    }
    return detail;
  });

export const listMyAppointments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ApptRow>`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where a.user_id = ${context.userId}
      order by a.appt_date desc, a.start_min desc
    `;
    return hydrateAppointments(rows);
  });

export const listUpcomingAppointments = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const from = addDaysIso(todayInRome(), -21);
  const to = addDaysIso(todayInRome(), 60);
  const rows = await sql<ApptRow>`
    select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
           a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
           a.status, a.user_id, a.code, a.created_at::text as created_at,
           s.name as stylist_name, s.initials as stylist_initials
    from appointments a
    join stylists s on s.id = a.stylist_id
    where a.appt_date >= ${from} and a.appt_date <= ${to}
    order by a.appt_date, a.start_min, s.sort
  `;
  return hydrateAppointments(rows);
});

export const listAgendaRange = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ date: dateSchema }))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    const rows = await sql<ApptRow>`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where a.appt_date = ${data.date}
      order by a.start_min, s.sort
    `;
    return hydrateAppointments(rows);
  });

export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: idSchema,
      status: z.enum(["confirmed", "cancelled", "done"]),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    await sql`
      update appointments set status = ${data.status} where id = ${data.id}
    `;
    return { ok: true };
  });

const serviceWriteSchema = z.object({
  id: idSchema.optional(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional().or(z.literal("")),
  priceEuro: z.number().min(0).max(500),
  durationMin: z.union([z.literal(30), z.literal(60)]),
  category: z.enum(["hair", "beard", "addon", "treatment"]),
  isPrimary: z.boolean(),
  isAddon: z.boolean(),
  active: z.boolean(),
  sort: z.number().int().min(0).max(999),
});

export const saveService = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(serviceWriteSchema)
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    const id = data.id ?? newId();
    const price = Math.round(data.priceEuro * 100);
    const description = data.description ?? "";
    await sql`
      insert into services (
        id, name, description, price_cents, duration_min, category,
        is_primary, is_addon, active, sort
      ) values (
        ${id}, ${data.name}, ${description}, ${price}, ${data.durationMin},
        ${data.category}, ${data.isPrimary}, ${data.isAddon}, ${data.active}, ${data.sort}
      )
      on conflict (id) do update set
        name = excluded.name,
        description = excluded.description,
        price_cents = excluded.price_cents,
        duration_min = excluded.duration_min,
        category = excluded.category,
        is_primary = excluded.is_primary,
        is_addon = excluded.is_addon,
        active = excluded.active,
        sort = excluded.sort
    `;
    invalidateCatalog();
    return { id };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: idSchema }))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    await sql`update services set active = false where id = ${data.id}`;
    invalidateCatalog();
    return { ok: true };
  });

export type SalonMedia = {
  logo: string | null;
  hero: string | null;
};

export const getSalonMedia = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ key: string; value: string }>`
    select key, value from salon_settings where key in ('logo', 'hero')
  `;
  const media: SalonMedia = { logo: null, hero: null };
  for (const row of rows) {
    if (row.key === "logo" || row.key === "hero") media[row.key] = row.value;
  }
  return media;
});

export const saveSalonMedia = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      key: z.enum(["logo", "hero"]),
      value: z.string().max(1_800_000).nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    if (!data.value) {
      await sql`delete from salon_settings where key = ${data.key}`;
      return { ok: true };
    }
    await sql`
      insert into salon_settings (key, value) values (${data.key}, ${data.value})
      on conflict (key) do update set value = excluded.value
    `;
    return { ok: true };
  });

export const saveStylistPhoto = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: idSchema,
      photoUrl: z.string().max(1_800_000).nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    await sql`update stylists set photo_url = ${data.photoUrl} where id = ${data.id}`;
    invalidateCatalog();
    return { ok: true };
  });

export type { ServiceCategory };
