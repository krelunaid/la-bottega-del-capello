import { o as __toESM } from "../_runtime.mjs";
import { a as formatDateLong, c as isOpenDay, n as addDaysIso, o as formatEuro, s as formatMinutes, u as todayInRome } from "./salon-mJRWrfSy.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as listAllServicesAdmin, c as listStylists, d as updateAppointmentStatus, i as listAgendaRange, n as deleteService, u as saveService } from "./salon-server-CBmt23jz.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as cn, t as Button } from "./button-hKQYUImO.mjs";
import { n as useCurrentUserState, t as SiteHeader } from "./site-header-BlD6xSLZ.mjs";
import { n as Label, t as Input } from "./label-D4hFiyrR.mjs";
import { t as Badge } from "./badge-CCLAPtht.mjs";
import { t as Textarea } from "./textarea-D3eEiHYX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sala-CnnjkK6k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* Auth is ON by default (including the sandbox live preview, which does real
* sign-in). Visitors are signed out until they authenticate. The shared dev
* user only appears when auth is explicitly disabled (`VITE_AUTH_ENABLED=false`).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
function SalaPage() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { solid: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-6xl px-4 py-16 text-sm text-muted",
			children: "Apro la sala…"
		})]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalaDesk, {});
}
function SalaDesk() {
	const [tab, setTab] = (0, import_react.useState)("agenda");
	const [date, setDate] = (0, import_react.useState)(todayInRome());
	const [stylists, setStylists] = (0, import_react.useState)([]);
	const [appointments, setAppointments] = (0, import_react.useState)([]);
	const [services, setServices] = (0, import_react.useState)([]);
	async function reloadAgenda(d = date) {
		const rows = await listAgendaRange({ data: { date: d } });
		setAppointments(rows);
	}
	async function reloadServices() {
		const rows = await listAllServicesAdmin();
		setServices(rows);
	}
	(0, import_react.useEffect)(() => {
		listStylists().then(setStylists).catch(() => setStylists([]));
	}, []);
	(0, import_react.useEffect)(() => {
		reloadAgenda(date).catch(() => setAppointments([]));
	}, [date]);
	(0, import_react.useEffect)(() => {
		if (tab === "listino") reloadServices().catch(() => setServices([]));
	}, [tab]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { solid: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-4 py-8 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.22em] text-accent",
					children: "Area staff"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-4xl tracking-tight",
					children: "Sala"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
						active: tab === "agenda",
						onClick: () => setTab("agenda"),
						children: "Agenda"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBtn, {
						active: tab === "listino",
						onClick: () => setTab("listino"),
						children: "Listino"
					})]
				})]
			}), tab === "agenda" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Agenda, {
				date,
				onDate: setDate,
				stylists,
				appointments,
				onChange: () => void reloadAgenda()
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Listino, {
				services,
				onChange: () => void reloadServices()
			})]
		})]
	});
}
function TabBtn({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-10 rounded-full px-4 text-sm", active ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"),
		children
	});
}
function Agenda({ date, onDate, stylists, appointments, onChange }) {
	const byStylist = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const a of appointments) {
			const list = map.get(a.stylist_id) ?? [];
			list.push(a);
			map.set(a.stylist_id, list);
		}
		return map;
	}, [appointments]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => onDate(addDaysIso(date, -1)),
							children: "Giorno prima"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => onDate(todayInRome()),
							children: "Oggi"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => onDate(addDaysIso(date, 1)),
							children: "Giorno dopo"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl capitalize",
					children: formatDateLong(date)
				})]
			}),
			!isOpenDay(date) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted",
				children: "Salone chiuso in questo giorno."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-4 md:grid-cols-2",
				children: stylists.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-line bg-surface p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: s.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.16em] text-muted",
							children: s.role
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-10 place-items-center rounded-full bg-bg font-display text-accent",
							children: s.initials
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 space-y-2",
						children: [(byStylist.get(s.id) ?? []).slice().sort((a, b) => a.start_min - b.start_min).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: cn("rounded-lg border border-line bg-bg px-3 py-2.5", a.status === "cancelled" && "opacity-50", a.status === "done" && "border-ok/30"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm tabular-nums text-accent",
										children: [
											formatMinutes(a.start_min),
											"–",
											formatMinutes(a.start_min + a.duration_min),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-2 text-subtle",
												children: [a.duration_min, " min"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-fg",
										children: a.customer_name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [
											a.services.map((x) => x.service_name).join(" + "),
											" · ",
											a.code
										]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "muted",
									children: a.status === "cancelled" ? "Annullato" : a.status === "done" ? "Fatto" : "In agenda"
								})]
							}), a.status === "confirmed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-xs text-muted hover:text-fg",
									onClick: () => updateAppointmentStatus({ data: {
										id: a.id,
										status: "done"
									} }).then(onChange).catch((err) => toast.error(String(err))),
									children: "Segna fatto"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-xs text-danger hover:underline",
									onClick: () => updateAppointmentStatus({ data: {
										id: a.id,
										status: "cancelled"
									} }).then(() => {
										toast.success("Appuntamento annullato");
										onChange();
									}).catch((err) => toast.error(String(err))),
									children: "Annulla"
								})]
							}) : null]
						}, a.id)), (byStylist.get(s.id) ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-6 text-center text-sm text-subtle",
							children: "Nessun appuntamento"
						}) : null]
					})]
				}, s.id))
			})
		]
	});
}
function Listino({ services, onChange }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Aggiungi, modifica prezzi e durate. 30 o 60 minuti, nient'altro."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => {
						setCreating(true);
						setEditing(null);
					},
					children: "Nuovo servizio"
				})]
			}),
			creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceEditor, {
				onCancel: () => setCreating(false),
				onSaved: () => {
					setCreating(false);
					onChange();
				}
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-2",
				children: services.map((s) => editing?.id === s.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceEditor, {
					initial: s,
					onCancel: () => setEditing(null),
					onSaved: () => {
						setEditing(null);
						onChange();
					}
				}, s.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex flex-col justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center", !s.active && "opacity-50"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: s.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-subtle",
						children: [
							s.duration_min,
							" min · ",
							s.category,
							s.is_primary ? " · in vetrina" : "",
							s.is_addon ? " · extra" : "",
							!s.active ? " · nascosto" : ""
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: formatEuro(s.price_cents)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-sm text-muted hover:text-fg",
								onClick: () => {
									setCreating(false);
									setEditing(s);
								},
								children: "Modifica"
							}),
							s.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-sm text-danger",
								onClick: () => deleteService({ data: { id: s.id } }).then(() => {
									toast.success("Servizio nascosto");
									onChange();
								}).catch((err) => toast.error(String(err))),
								children: "Nascondi"
							}) : null
						]
					})]
				}, s.id))
			})
		]
	});
}
function ServiceEditor({ initial, onCancel, onSaved }) {
	const [name, setName] = (0, import_react.useState)(initial?.name ?? "");
	const [description, setDescription] = (0, import_react.useState)(initial?.description ?? "");
	const [price, setPrice] = (0, import_react.useState)(initial ? String((initial.price_cents / 100).toFixed(2)).replace(".", ",") : "");
	const [duration, setDuration] = (0, import_react.useState)(initial?.duration_min ?? 30);
	const [category, setCategory] = (0, import_react.useState)(initial?.category ?? "hair");
	const [isPrimary, setIsPrimary] = (0, import_react.useState)(initial?.is_primary ?? true);
	const [isAddon, setIsAddon] = (0, import_react.useState)(initial?.is_addon ?? false);
	const [active, setActive] = (0, import_react.useState)(initial?.active ?? true);
	const [sort, setSort] = (0, import_react.useState)(String(initial?.sort ?? 20));
	const [saving, setSaving] = (0, import_react.useState)(false);
	async function save() {
		const euro = Number(price.replace(",", "."));
		if (!name.trim() || Number.isNaN(euro)) {
			toast.error("Nome e prezzo sono obbligatori");
			return;
		}
		setSaving(true);
		try {
			await saveService({ data: {
				id: initial?.id,
				name: name.trim(),
				description: description.trim(),
				priceEuro: euro,
				durationMin: duration,
				category,
				isPrimary,
				isAddon,
				active,
				sort: Number(sort) || 20
			} });
			toast.success("Listino aggiornato");
			onSaved();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Salvataggio non riuscito");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 grid gap-3 rounded-xl border border-accent/40 bg-elevated p-4",
		onSubmit: (e) => {
			e.preventDefault();
			save();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nome" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						required: true
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Prezzo (€)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: price,
						onChange: (e) => setPrice(e.target.value),
						inputMode: "decimal"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Descrizione" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: description,
					onChange: (e) => setDescription(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Durata" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: [30, 60].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setDuration(d),
								className: cn("h-11 flex-1 rounded-md border text-sm", duration === d ? "border-accent bg-accent text-accent-fg" : "border-line bg-bg"),
								children: [d, " min"]
							}, d))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Categoria" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-11 rounded-md border border-line bg-bg px-3 text-sm text-fg",
							value: category,
							onChange: (e) => setCategory(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "hair",
									children: "Capelli"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "beard",
									children: "Barba"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "treatment",
									children: "Trattamento"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "addon",
									children: "Altro extra"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ordine" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: sort,
							onChange: (e) => setSort(e.target.value),
							inputMode: "numeric"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: isPrimary,
							onChange: (e) => setIsPrimary(e.target.checked)
						}), "In vetrina (primo passo)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: isAddon,
							onChange: (e) => setIsAddon(e.target.checked)
						}), "Extra dopo il servizio"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: active,
							onChange: (e) => setActive(e.target.checked)
						}), "Visibile"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: onCancel,
					children: "Annulla"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: saving,
					children: saving ? "Salvo…" : "Salva"
				})]
			})
		]
	});
}
//#endregion
export { SalaPage as component };
