import { i as combinedDuration, r as availableSlots } from "./salon-mJRWrfSy.mjs";
import { i as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { i as getSql, t as authMiddleware } from "./middleware-F5MeKAxo.mjs";
import { fn as literal, hn as object, ln as array, mn as number, sn as _enum, un as boolean, vn as string, yn as union } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/salon-server-BzcK9MNE.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var idSchema = string().min(1).max(80);
var dateSchema = string().regex(/^\d{4}-\d{2}-\d{2}$/);
function newId() {
	return crypto.randomUUID();
}
function newCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let body = "";
	const bytes = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(5));
	for (const b of bytes) body += alphabet[b % 32];
	return `BT-${body}`;
}
async function hydrateAppointments(rows) {
	if (rows.length === 0) return [];
	const sql = await getSql();
	const ids = rows.map((r) => r.id);
	const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
	const services = await sql.query(`select appointment_id, service_id, service_name, price_cents, duration_min
     from appointment_services where appointment_id in (${placeholders})`, ids);
	const byAppt = /* @__PURE__ */ new Map();
	for (const s of services) {
		const list = byAppt.get(s.appointment_id) ?? [];
		list.push(s);
		byAppt.set(s.appointment_id, list);
	}
	return rows.map((r) => {
		const svcs = byAppt.get(r.id) ?? [];
		return {
			...r,
			duration_min: r.duration_min === 60 ? 60 : 30,
			services: svcs,
			total_cents: svcs.reduce((sum, s) => sum + s.price_cents, 0)
		};
	});
}
var listStylists_createServerFn_handler = createServerRpc({
	id: "2e861dba857b0086fd08873d4374bae17b8aedb84cc9a6bc2e1a287d2d5f0c5e",
	name: "listStylists",
	filename: "src/lib/salon-server.ts"
}, (opts) => listStylists.__executeServer(opts));
var listStylists = createServerFn({ method: "GET" }).handler(listStylists_createServerFn_handler, async () => {
	return (await getSql())`
    select id, name, role, bio, instagram, initials, sort, active
    from stylists where active = true order by sort
  `;
});
var listServices_createServerFn_handler = createServerRpc({
	id: "0576cdde656911e5197f501f3e034d241654f080dc2898b55356d26ddf75a477",
	name: "listServices",
	filename: "src/lib/salon-server.ts"
}, (opts) => listServices.__executeServer(opts));
var listServices = createServerFn({ method: "GET" }).handler(listServices_createServerFn_handler, async () => {
	return (await (await getSql())`
    select id, name, description, price_cents, duration_min, category,
           is_primary, is_addon, active, sort
    from services where active = true order by sort, name
  `).map((r) => ({
		...r,
		duration_min: r.duration_min === 60 ? 60 : 30
	}));
});
var listAllServicesAdmin_createServerFn_handler = createServerRpc({
	id: "aceb270a49c402e553ca74128c5942d1fb3e6dd5a0422802e1392ed7351951b9",
	name: "listAllServicesAdmin",
	filename: "src/lib/salon-server.ts"
}, (opts) => listAllServicesAdmin.__executeServer(opts));
var listAllServicesAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAllServicesAdmin_createServerFn_handler, async () => {
	return (await (await getSql())`
      select id, name, description, price_cents, duration_min, category,
             is_primary, is_addon, active, sort
      from services order by sort, name
    `).map((r) => ({
		...r,
		duration_min: r.duration_min === 60 ? 60 : 30
	}));
});
var getAvailability_createServerFn_handler = createServerRpc({
	id: "bfac57b7f1d96b760f689243e7d8ef403871b09fe39945eb52b25c408e9294a2",
	name: "getAvailability",
	filename: "src/lib/salon-server.ts"
}, (opts) => getAvailability.__executeServer(opts));
var getAvailability = createServerFn({ method: "GET" }).validator(object({
	stylistId: idSchema,
	date: dateSchema,
	duration: union([literal(30), literal(60)])
})).handler(getAvailability_createServerFn_handler, async ({ data }) => {
	const occupied = await (await getSql())`
      select start_min, duration_min from appointments
      where stylist_id = ${data.stylistId}
        and appt_date = ${data.date}
        and status <> 'cancelled'
    `;
	return {
		occupied,
		slots: availableSlots(data.date, data.duration, occupied)
	};
});
var getDayAgenda_createServerFn_handler = createServerRpc({
	id: "313d7fa7a2d50ae75032df30beb07dd5fad0a5c680379d8c27fc867a98405cce",
	name: "getDayAgenda",
	filename: "src/lib/salon-server.ts"
}, (opts) => getDayAgenda.__executeServer(opts));
var getDayAgenda = createServerFn({ method: "GET" }).validator(object({ date: dateSchema })).handler(getDayAgenda_createServerFn_handler, async ({ data }) => {
	return hydrateAppointments(await (await getSql())`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where a.appt_date = ${data.date} and a.status <> 'cancelled'
      order by a.start_min, s.sort
    `);
});
var bookSchema = object({
	stylistId: idSchema,
	serviceIds: array(idSchema).min(1).max(8),
	date: dateSchema,
	startMin: number().int().min(0).max(1440),
	customerName: string().trim().min(2).max(80),
	customerPhone: string().trim().min(6).max(24),
	customerEmail: string().trim().max(120),
	notes: string().trim().max(400)
});
var bookAppointment_createServerFn_handler = createServerRpc({
	id: "f873b0f29782f4e44abdb08de70eccbcea9cdfda2c5a649297c40ecca75411ab",
	name: "bookAppointment",
	filename: "src/lib/salon-server.ts"
}, (opts) => bookAppointment.__executeServer(opts));
var bookAppointment = createServerFn({ method: "POST" }).validator(bookSchema).handler(bookAppointment_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if ((await sql`
      select id from stylists where id = ${data.stylistId} and active = true
    `).length === 0) throw new Error("Barbiere non disponibile.");
	const placeholders = data.serviceIds.map((_, i) => `$${i + 1}`).join(", ");
	const services = await sql.query(`select id, name, description, price_cents, duration_min, category,
              is_primary, is_addon, active, sort
       from services where id in (${placeholders}) and active = true`, data.serviceIds);
	if (services.length !== data.serviceIds.length) throw new Error("Uno o più servizi non sono più disponibili.");
	const duration = combinedDuration(services);
	const occupied = await sql`
      select start_min, duration_min from appointments
      where stylist_id = ${data.stylistId}
        and appt_date = ${data.date}
        and status <> 'cancelled'
    `;
	if (!availableSlots(data.date, duration, occupied).includes(data.startMin)) throw new Error("Orario non più disponibile. Scegline un altro.");
	const id = newId();
	const code = newCode();
	const emailRaw = data.customerEmail.trim();
	if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) throw new Error("Email non valida.");
	const email = emailRaw || null;
	const notes = data.notes.trim() || null;
	await sql`
      insert into appointments (
        id, stylist_id, customer_name, customer_phone, customer_email, notes,
        appt_date, start_min, duration_min, status, user_id, code
      ) values (
        ${id}, ${data.stylistId}, ${data.customerName}, ${data.customerPhone},
        ${email}, ${notes}, ${data.date}, ${data.startMin}, ${duration},
        'confirmed', ${null}, ${code}
      )
    `;
	for (const svc of services) await sql`
        insert into appointment_services (
          appointment_id, service_id, service_name, price_cents, duration_min
        ) values (
          ${id}, ${svc.id}, ${svc.name}, ${svc.price_cents}, ${svc.duration_min}
        )
      `;
	const [detail] = await hydrateAppointments(await sql`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where a.id = ${id}
    `);
	return detail;
});
var lookupAppointment_createServerFn_handler = createServerRpc({
	id: "2169441d6808f8d1905b7eacc9045926cbc97a404a84b406f5079565387c4a11",
	name: "lookupAppointment",
	filename: "src/lib/salon-server.ts"
}, (opts) => lookupAppointment.__executeServer(opts));
var lookupAppointment = createServerFn({ method: "GET" }).validator(object({
	code: string().trim().min(3).max(16),
	phone: string().trim().min(6).max(24).optional()
})).handler(lookupAppointment_createServerFn_handler, async ({ data }) => {
	const rows = await (await getSql())`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where upper(a.code) = ${data.code.trim().toUpperCase()}
    `;
	if (rows.length === 0) return null;
	if (data.phone) {
		const digits = data.phone.replace(/\D/g, "");
		const stored = rows[0].customer_phone.replace(/\D/g, "");
		if (digits && stored && !stored.endsWith(digits) && !digits.endsWith(stored)) return null;
	}
	const [detail] = await hydrateAppointments(rows);
	return detail;
});
var listMyAppointments_createServerFn_handler = createServerRpc({
	id: "8a0a29a9c619689b12c90410132fccfdbcb58a5c07c0876b38c38b7c33a99cdf",
	name: "listMyAppointments",
	filename: "src/lib/salon-server.ts"
}, (opts) => listMyAppointments.__executeServer(opts));
var listMyAppointments = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyAppointments_createServerFn_handler, async ({ context }) => {
	return hydrateAppointments(await (await getSql())`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where a.user_id = ${context.userId}
      order by a.appt_date desc, a.start_min desc
    `);
});
var listAgendaRange_createServerFn_handler = createServerRpc({
	id: "e2b58d504e3ea10cf7076adc8f3d5832105491ec7f1aa177cc371586063de58a",
	name: "listAgendaRange",
	filename: "src/lib/salon-server.ts"
}, (opts) => listAgendaRange.__executeServer(opts));
var listAgendaRange = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ date: dateSchema })).handler(listAgendaRange_createServerFn_handler, async ({ data }) => {
	return hydrateAppointments(await (await getSql())`
      select a.id, a.stylist_id, a.customer_name, a.customer_phone, a.customer_email,
             a.notes, a.appt_date::text as appt_date, a.start_min, a.duration_min,
             a.status, a.user_id, a.code, a.created_at::text as created_at,
             s.name as stylist_name, s.initials as stylist_initials
      from appointments a
      join stylists s on s.id = a.stylist_id
      where a.appt_date = ${data.date}
      order by a.start_min, s.sort
    `);
});
var updateAppointmentStatus_createServerFn_handler = createServerRpc({
	id: "130686b74bd5bf777667a0912d124c8ce3e449a7aa1e356a189c2d627b08c63e",
	name: "updateAppointmentStatus",
	filename: "src/lib/salon-server.ts"
}, (opts) => updateAppointmentStatus.__executeServer(opts));
var updateAppointmentStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: idSchema,
	status: _enum([
		"confirmed",
		"cancelled",
		"done"
	])
})).handler(updateAppointmentStatus_createServerFn_handler, async ({ data }) => {
	await (await getSql())`
      update appointments set status = ${data.status} where id = ${data.id}
    `;
	return { ok: true };
});
var serviceWriteSchema = object({
	id: idSchema.optional(),
	name: string().trim().min(2).max(80),
	description: string().trim().max(240).optional().or(literal("")),
	priceEuro: number().min(0).max(500),
	durationMin: union([literal(30), literal(60)]),
	category: _enum([
		"hair",
		"beard",
		"addon",
		"treatment"
	]),
	isPrimary: boolean(),
	isAddon: boolean(),
	active: boolean(),
	sort: number().int().min(0).max(999)
});
var saveService_createServerFn_handler = createServerRpc({
	id: "1b8574971bad5af412c9a4fa6761b24ffc2d96fc649b1d3317f15d805f23c5c4",
	name: "saveService",
	filename: "src/lib/salon-server.ts"
}, (opts) => saveService.__executeServer(opts));
var saveService = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(serviceWriteSchema).handler(saveService_createServerFn_handler, async ({ data }) => {
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
	return { id };
});
var deleteService_createServerFn_handler = createServerRpc({
	id: "93b9c346cbe049122ec491aabd2dfaaf47fd1987ebc89448430859f896828463",
	name: "deleteService",
	filename: "src/lib/salon-server.ts"
}, (opts) => deleteService.__executeServer(opts));
var deleteService = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: idSchema })).handler(deleteService_createServerFn_handler, async ({ data }) => {
	await (await getSql())`update services set active = false where id = ${data.id}`;
	return { ok: true };
});
//#endregion
export { bookAppointment_createServerFn_handler, deleteService_createServerFn_handler, getAvailability_createServerFn_handler, getDayAgenda_createServerFn_handler, listAgendaRange_createServerFn_handler, listAllServicesAdmin_createServerFn_handler, listMyAppointments_createServerFn_handler, listServices_createServerFn_handler, listStylists_createServerFn_handler, lookupAppointment_createServerFn_handler, saveService_createServerFn_handler, updateAppointmentStatus_createServerFn_handler };
