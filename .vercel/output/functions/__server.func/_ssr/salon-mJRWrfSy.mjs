//#region node_modules/.nitro/vite/services/ssr/assets/salon-mJRWrfSy.js
var SALON = {
	name: "La Bottega del Capello",
	tagline: "Eleganza. Precisione. Stile.",
	phone: "392 375 3847",
	phoneHref: "tel:+393923753847",
	whatsappHref: "https://wa.me/393923753847",
	address: "Via Romana Vecchia, 36",
	city: "51013 Chiesanuova (PT)",
	mapsHref: "https://www.google.com/maps/search/?api=1&query=Via+Romana+Vecchia+36+Chiesanuova+PT",
	facebook: "https://www.facebook.com/labottegadelcapello2025",
	instagram: "https://www.instagram.com/_la_bottega_del_capello/",
	hoursLabel: "Mar–Ven 8:30–13:00 / 15:30–20:00 · Sab 8:00–19:00"
};
var SALON_TZ = "Europe/Rome";
/** Combined visit length: single 30-min service stays 30, anything more is 60. */
function combinedDuration(services) {
	return services.reduce((sum, s) => sum + s.duration_min, 0) <= 30 ? 30 : 60;
}
function formatEuro(cents) {
	return new Intl.NumberFormat("it-IT", {
		style: "currency",
		currency: "EUR"
	}).format(cents / 100);
}
function pad2(n) {
	return String(n).padStart(2, "0");
}
function formatMinutes(min) {
	return `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
}
function formatDateLong(iso) {
	return new Intl.DateTimeFormat("it-IT", {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: "UTC"
	}).format(/* @__PURE__ */ new Date(`${iso}T12:00:00Z`));
}
function todayInRome() {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: SALON_TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(/* @__PURE__ */ new Date());
}
function nowMinutesInRome() {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: SALON_TZ,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(/* @__PURE__ */ new Date());
	const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
	const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
	return h * 60 + m;
}
function weekdayOf(iso) {
	return (/* @__PURE__ */ new Date(`${iso}T12:00:00Z`)).getUTCDay();
}
/** Opening windows as [startMin, endMin) in local salon time. Closed Sun/Mon. */
function openingWindows(iso) {
	const dow = weekdayOf(iso);
	if (dow === 0 || dow === 1) return [];
	if (dow === 6) return [[480, 1140]];
	return [[510, 780], [930, 1200]];
}
function isOpenDay(iso) {
	return openingWindows(iso).length > 0;
}
function overlaps(aStart, aDur, bStart, bDur) {
	return aStart < bStart + bDur && aStart + aDur > bStart;
}
function availableSlots(iso, duration, occupied, opts) {
	const windows = openingWindows(iso);
	const hidePast = opts?.hidePast !== false && iso === todayInRome();
	const now = nowMinutesInRome();
	const slots = [];
	for (const [start, end] of windows) for (let t = start; t + duration <= end; t += 30) {
		if (hidePast && t < now + 15) continue;
		if (!occupied.some((o) => overlaps(t, duration, o.start_min, o.duration_min))) slots.push(t);
	}
	return slots;
}
function addDaysIso(iso, days) {
	const d = /* @__PURE__ */ new Date(`${iso}T12:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}
function monthGrid(year, month) {
	const first = new Date(Date.UTC(year, month, 1));
	const startPad = first.getUTCDay() === 0 ? 6 : first.getUTCDay() - 1;
	const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	const cells = Array.from({ length: startPad }, () => null);
	for (let day = 1; day <= days; day += 1) cells.push(`${year}-${pad2(month + 1)}-${pad2(day)}`);
	while (cells.length % 7 !== 0) cells.push(null);
	return cells;
}
//#endregion
export { formatDateLong as a, isOpenDay as c, combinedDuration as i, monthGrid as l, addDaysIso as n, formatEuro as o, availableSlots as r, formatMinutes as s, SALON as t, todayInRome as u };
