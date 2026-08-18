import { i as createServerFn, o as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-F5MeKAxo.mjs";
import { fn as literal, hn as object, ln as array, mn as number, sn as _enum, un as boolean, vn as string, yn as union } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/salon-server-CBmt23jz.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var idSchema = string().min(1).max(80);
var dateSchema = string().regex(/^\d{4}-\d{2}-\d{2}$/);
var listStylists = createServerFn({ method: "GET" }).handler(createSsrRpc("2e861dba857b0086fd08873d4374bae17b8aedb84cc9a6bc2e1a287d2d5f0c5e"));
var listServices = createServerFn({ method: "GET" }).handler(createSsrRpc("0576cdde656911e5197f501f3e034d241654f080dc2898b55356d26ddf75a477"));
var listAllServicesAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("aceb270a49c402e553ca74128c5942d1fb3e6dd5a0422802e1392ed7351951b9"));
var getAvailability = createServerFn({ method: "GET" }).validator(object({
	stylistId: idSchema,
	date: dateSchema,
	duration: union([literal(30), literal(60)])
})).handler(createSsrRpc("bfac57b7f1d96b760f689243e7d8ef403871b09fe39945eb52b25c408e9294a2"));
createServerFn({ method: "GET" }).validator(object({ date: dateSchema })).handler(createSsrRpc("313d7fa7a2d50ae75032df30beb07dd5fad0a5c680379d8c27fc867a98405cce"));
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
var bookAppointment = createServerFn({ method: "POST" }).validator(bookSchema).handler(createSsrRpc("f873b0f29782f4e44abdb08de70eccbcea9cdfda2c5a649297c40ecca75411ab"));
var lookupAppointment = createServerFn({ method: "GET" }).validator(object({
	code: string().trim().min(3).max(16),
	phone: string().trim().min(6).max(24).optional()
})).handler(createSsrRpc("2169441d6808f8d1905b7eacc9045926cbc97a404a84b406f5079565387c4a11"));
var listMyAppointments = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8a0a29a9c619689b12c90410132fccfdbcb58a5c07c0876b38c38b7c33a99cdf"));
var listAgendaRange = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator(object({ date: dateSchema })).handler(createSsrRpc("e2b58d504e3ea10cf7076adc8f3d5832105491ec7f1aa177cc371586063de58a"));
var updateAppointmentStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: idSchema,
	status: _enum([
		"confirmed",
		"cancelled",
		"done"
	])
})).handler(createSsrRpc("130686b74bd5bf777667a0912d124c8ce3e449a7aa1e356a189c2d627b08c63e"));
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
var saveService = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(serviceWriteSchema).handler(createSsrRpc("1b8574971bad5af412c9a4fa6761b24ffc2d96fc649b1d3317f15d805f23c5c4"));
var deleteService = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: idSchema })).handler(createSsrRpc("93b9c346cbe049122ec491aabd2dfaaf47fd1987ebc89448430859f896828463"));
//#endregion
export { listAllServicesAdmin as a, listStylists as c, updateAppointmentStatus as d, listAgendaRange as i, lookupAppointment as l, deleteService as n, listMyAppointments as o, getAvailability as r, listServices as s, bookAppointment as t, saveService as u };
