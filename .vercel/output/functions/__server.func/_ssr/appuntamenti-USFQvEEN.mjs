import { o as __toESM } from "../_runtime.mjs";
import { a as formatDateLong, o as formatEuro, s as formatMinutes } from "./salon-mJRWrfSy.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as lookupAppointment, o as listMyAppointments } from "./salon-server-CBmt23jz.mjs";
import { r as Route$4 } from "./router-CV76N2Cg.mjs";
import { t as Button } from "./button-hKQYUImO.mjs";
import { n as useCurrentUserState, t as SiteHeader } from "./site-header-BlD6xSLZ.mjs";
import { t as SiteFooter } from "./site-footer-7XdDHdaL.mjs";
import { n as Label, t as Input } from "./label-D4hFiyrR.mjs";
import { t as Badge } from "./badge-CCLAPtht.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/appuntamenti-USFQvEEN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppointmentsPage() {
	const { code } = Route$4.useSearch();
	const navigate = useNavigate({ from: "/appuntamenti" });
	const { user, isPending } = useCurrentUserState();
	const [mine, setMine] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)(code ?? "");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [found, setFound] = (0, import_react.useState)(void 0);
	const [looking, setLooking] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		listMyAppointments().then(setMine).catch(() => setMine([]));
	}, [user, isPending]);
	(0, import_react.useEffect)(() => {
		if (!code) return;
		setQuery(code);
		runLookup(code, "");
	}, [code]);
	async function runLookup(nextCode, nextPhone) {
		setLooking(true);
		try {
			const row = await lookupAppointment({ data: {
				code: nextCode,
				phone: nextPhone || void 0
			} });
			setFound(row);
		} catch {
			setFound(null);
		} finally {
			setLooking(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { solid: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-3xl px-4 py-12 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.22em] text-accent",
						children: "Agenda personale"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-4xl tracking-tight",
						children: "I tuoi appuntamenti"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Inserisci il codice ricevuto in conferma, oppure accedi per vedere le prenotazioni collegate al tuo account."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-8 grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end",
						onSubmit: (e) => {
							e.preventDefault();
							navigate({ search: { code: query.trim() || void 0 } });
							runLookup(query, phone);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Codice" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: query,
									onChange: (e) => setQuery(e.target.value.toUpperCase()),
									placeholder: "BT-XXXXX"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Telefono (facoltativo)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: phone,
									onChange: (e) => setPhone(e.target.value),
									placeholder: "333…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: looking || query.trim().length < 3,
								children: looking ? "Cerco…" : "Cerca"
							})
						]
					}),
					found === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-sm text-muted",
						children: "Nessun appuntamento con questi dati."
					}) : found ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppointmentCard, { detail: found })
					}) : null,
					user && mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Collegati al tuo account"
						}), mine.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: "Nessuna prenotazione sul tuo profilo."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-3",
							children: mine.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppointmentCard, { detail: row }, row.id))
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function AppointmentCard({ detail }) {
	const statusLabel = detail.status === "cancelled" ? "Annullato" : detail.status === "done" ? "Completato" : "Confermato";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl border border-line bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tracking-[0.08em] text-accent",
						children: detail.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-fg",
						children: [
							formatDateLong(detail.appt_date),
							" · ",
							formatMinutes(detail.start_min)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							detail.stylist_name,
							" · ",
							detail.duration_min,
							" min"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: detail.status === "cancelled" ? "muted" : "default",
					children: statusLabel
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-1 text-sm text-muted",
				children: detail.services.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.service_name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-fg",
						children: formatEuro(s.price_cents)
					})]
				}, s.service_id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-right text-sm tabular-nums",
				children: formatEuro(detail.total_cents)
			})
		]
	});
}
//#endregion
export { AppointmentsPage as component };
