import { o as __toESM } from "../_runtime.mjs";
import { a as formatDateLong, c as isOpenDay, i as combinedDuration, l as monthGrid, n as addDaysIso, o as formatEuro, s as formatMinutes, u as todayInRome } from "./salon-mJRWrfSy.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as getAvailability, t as bookAppointment } from "./salon-server-CBmt23jz.mjs";
import { c as ChevronLeft, i as Plus, l as Check, r as Scissors, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route$2 } from "./router-CV76N2Cg.mjs";
import { n as cn, t as Button } from "./button-hKQYUImO.mjs";
import { t as SiteHeader } from "./site-header-BlD6xSLZ.mjs";
import { t as SiteFooter } from "./site-footer-7XdDHdaL.mjs";
import { n as Label, t as Input } from "./label-D4hFiyrR.mjs";
import { t as Badge } from "./badge-CCLAPtht.mjs";
import { t as Textarea } from "./textarea-D3eEiHYX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prenota-DoKVj5pB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"Barbiere",
	"Servizio",
	"Extra",
	"Orario",
	"Conferma"
];
function BookingWizard({ stylists, services }) {
	const [step, setStep] = (0, import_react.useState)(0);
	const [stylistId, setStylistId] = (0, import_react.useState)(null);
	const [primaryId, setPrimaryId] = (0, import_react.useState)(null);
	const [addonIds, setAddonIds] = (0, import_react.useState)([]);
	const [date, setDate] = (0, import_react.useState)(() => {
		let d = todayInRome();
		for (let i = 0; i < 14; i += 1) {
			if (isOpenDay(d)) return d;
			d = addDaysIso(d, 1);
		}
		return d;
	});
	const [monthCursor, setMonthCursor] = (0, import_react.useState)(() => {
		const t = todayInRome();
		return {
			y: Number(t.slice(0, 4)),
			m: Number(t.slice(5, 7)) - 1
		};
	});
	const [startMin, setStartMin] = (0, import_react.useState)(null);
	const [slots, setSlots] = (0, import_react.useState)([]);
	const [loadingSlots, setLoadingSlots] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [done, setDone] = (0, import_react.useState)(null);
	const primaries = services.filter((s) => s.is_primary);
	const addons = services.filter((s) => s.is_addon && s.id !== primaryId);
	const selected = (0, import_react.useMemo)(() => {
		return [primaryId, ...addonIds].filter(Boolean).map((id) => services.find((s) => s.id === id)).filter((s) => Boolean(s));
	}, [
		primaryId,
		addonIds,
		services
	]);
	const duration = combinedDuration(selected.length ? selected : [{ duration_min: 30 }]);
	const total = selected.reduce((sum, s) => sum + s.price_cents, 0);
	const stylist = stylists.find((s) => s.id === stylistId) ?? null;
	(0, import_react.useEffect)(() => {
		if (!stylistId) return;
		let cancelled = false;
		setLoadingSlots(true);
		setStartMin(null);
		getAvailability({ data: {
			stylistId,
			date,
			duration
		} }).then((res) => {
			if (cancelled) return;
			setSlots(res.slots);
		}).catch(() => {
			if (!cancelled) setSlots([]);
		}).finally(() => {
			if (!cancelled) setLoadingSlots(false);
		});
		return () => {
			cancelled = true;
		};
	}, [
		stylistId,
		date,
		duration
	]);
	function toggleAddon(id) {
		setAddonIds((curr) => curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]);
	}
	function canNext() {
		if (step === 0) return Boolean(stylistId);
		if (step === 1) return Boolean(primaryId);
		if (step === 2) return Boolean(primaryId);
		if (step === 3) return startMin !== null;
		return name.trim().length >= 2 && phone.trim().length >= 6 && startMin !== null;
	}
	async function confirm() {
		if (!stylistId || !primaryId || startMin === null) return;
		setSubmitting(true);
		try {
			const detail = await bookAppointment({ data: {
				stylistId,
				serviceIds: [primaryId, ...addonIds],
				date,
				startMin,
				customerName: name.trim(),
				customerPhone: phone.trim(),
				customerEmail: email.trim(),
				notes: notes.trim()
			} });
			setDone(detail);
			toast.success("Appuntamento confermato");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Prenotazione non riuscita");
		} finally {
			setSubmitting(false);
		}
	}
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Confirmation, { detail: done });
	const cells = monthGrid(monthCursor.y, monthCursor.m);
	const monthLabel = new Intl.DateTimeFormat("it-IT", {
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	}).format(new Date(Date.UTC(monthCursor.y, monthCursor.m, 1)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mb-8 flex gap-1 overflow-x-auto pb-1",
				children: STEPS.map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: i > step,
						onClick: () => i <= step && setStep(i),
						className: cn("rounded-full px-3 py-1.5 text-xs tracking-wide whitespace-nowrap", i === step ? "bg-accent text-accent-fg" : i < step ? "bg-elevated text-fg" : "text-subtle"),
						children: label
					}), i < STEPS.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "/"
					}) : null]
				}, label))
			}),
			step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				kicker: "Il tuo barbiere",
				title: "Con chi vuoi prenotare?",
				copy: "Quattro mani, un solo standard. Scegli chi ti segue."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-2",
				children: stylists.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setStylistId(s.id);
						setStartMin(null);
					},
					className: cn("rounded-xl border p-4 text-left transition-[border-color,background-color] duration-150", stylistId === s.id ? "border-accent bg-elevated" : "border-line bg-surface hover:border-line-strong"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-12 shrink-0 place-items-center rounded-full bg-bg font-display text-lg text-accent",
							children: s.initials
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-display text-xl leading-tight",
							children: s.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-xs uppercase tracking-[0.16em] text-muted",
							children: s.role
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: s.bio
					})]
				}, s.id))
			})] }) : null,
			step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				kicker: "Il servizio",
				title: "Cosa ti serve oggi?",
				copy: "Scegli il servizio principale. Subito dopo potrai aggiungere barba e extra."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-3",
				children: primaries.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceRow, {
					service: s,
					selected: primaryId === s.id,
					onSelect: () => {
						setPrimaryId(s.id);
						setAddonIds((ids) => ids.filter((id) => id !== s.id));
					}
				}, s.id))
			})] }) : null,
			step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
					kicker: "Servizi extra",
					title: "Vuoi aggiungere un altro servizio?",
					copy: "Se fai i capelli, barba, tinta e trattamenti sono tutti disponibili. Puoi aggiungerne quanti ne vuoi."
				}),
				selected.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: selected.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [s.name, s.id !== primaryId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "ml-1 inline-flex",
						onClick: () => toggleAddon(s.id),
						"aria-label": `Rimuovi ${s.name}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
					}) : null] }, s.id))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid gap-3",
					children: addons.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceRow, {
						service: s,
						selected: addonIds.includes(s.id),
						onSelect: () => toggleAddon(s.id),
						addon: true
					}, s.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm text-subtle",
					children: [
						"L'appuntamento resta da ",
						duration,
						" minuti: un servizio breve occupa 30 minuti, più servizi o un servizio lungo occupano 60."
					]
				})
			] }) : null,
			step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
					kicker: "Data e ora",
					title: `Quando vieni da ${stylist?.name.split(" ")[0] ?? "noi"}?`,
					copy: "Gli orari già occupati spariscono. Se un appuntamento dura 30 minuti, il successivo parte alla fine di quei 30."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-xl border border-line bg-surface p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center justify-between",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-sm text-muted hover:text-fg",
									onClick: () => setMonthCursor((c) => c.m === 0 ? {
										y: c.y - 1,
										m: 11
									} : {
										y: c.y,
										m: c.m - 1
									}),
									children: "Precedente"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xl capitalize",
									children: monthLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-sm text-muted hover:text-fg",
									onClick: () => setMonthCursor((c) => c.m === 11 ? {
										y: c.y + 1,
										m: 0
									} : {
										y: c.y,
										m: c.m + 1
									}),
									children: "Successivo"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-subtle",
							children: [
								"Lun",
								"Mar",
								"Mer",
								"Gio",
								"Ven",
								"Sab",
								"Dom"
							].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "py-1",
								children: d
							}, d))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 grid grid-cols-7 gap-1",
							children: cells.map((iso, i) => {
								if (!iso) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}, `e-${i}`);
								const open = isOpenDay(iso);
								const past = iso < todayInRome();
								const selectedDay = iso === date;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: !open || past,
									onClick: () => setDate(iso),
									className: cn("grid aspect-square place-items-center rounded-md text-sm tabular-nums", selectedDay && "bg-accent text-accent-fg", !selectedDay && open && !past && "text-fg hover:bg-elevated", (!open || past) && "text-subtle/50"),
									children: Number(iso.slice(8))
								}, iso);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs text-subtle",
							children: "Chiusi domenica e lunedì. Pausa pranzo mar–ven 13:00–15:30."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs uppercase tracking-[0.18em] text-subtle",
						children: [
							"Disponibilità · ",
							formatDateLong(date),
							" · ",
							duration,
							" min"
						]
					}), loadingSlots ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "Controllo l'agenda…"
					}) : slots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "Nessuno spazio libero in questo giorno. Prova un'altra data."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4",
						children: slots.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setStartMin(t),
							className: cn("h-11 rounded-md border text-sm tabular-nums", startMin === t ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface text-fg hover:border-line-strong"),
							children: formatMinutes(t)
						}, t))
					})]
				})
			] }) : null,
			step === 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				kicker: "I tuoi dati",
				title: "Conferma la prenotazione",
				copy: "Ti lasciamo un codice da conservare. Puoi anche scriverci su WhatsApp se preferisci."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nome e cognome",
						htmlFor: "bk-name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "bk-name",
							value: name,
							onChange: (e) => setName(e.target.value),
							autoComplete: "name",
							placeholder: "Mario Rossi"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Telefono",
						htmlFor: "bk-phone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "bk-phone",
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							autoComplete: "tel",
							inputMode: "tel",
							placeholder: "333 123 4567"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email (facoltativa)",
						htmlFor: "bk-email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "bk-email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							autoComplete: "email",
							type: "email",
							placeholder: "mario@email.it"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Note per il barbiere",
						htmlFor: "bk-notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "bk-notes",
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							placeholder: "Preferenze, lunghezza, primo taglio…"
						})
					})
				]
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => setStep((s) => Math.max(0, s - 1)),
					disabled: step === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {}), "Indietro"]
				}), step < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => canNext() && setStep((s) => s + 1),
					disabled: !canNext(),
					children: "Continua"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => void confirm(),
					disabled: !canNext() || submitting,
					children: submitting ? "Prenoto…" : "Conferma appuntamento"
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "h-fit rounded-xl border border-line bg-surface p-5 lg:sticky lg:top-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.18em] text-subtle",
					children: "Il tuo appuntamento"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Barbiere",
							v: stylist?.name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Servizi",
							v: selected.length ? selected.map((s) => s.name).join(", ") : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Durata",
							v: `${duration} minuti`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Quando",
							v: startMin !== null ? `${formatDateLong(date)} · ${formatMinutes(startMin)}` : formatDateLong(date)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Totale",
							v: selected.length ? formatEuro(total) : "—"
						})
					]
				}),
				selected.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-5 space-y-2 border-t border-line pt-4 text-sm",
					children: selected.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-fg",
							children: formatEuro(s.price_cents)
						})]
					}, s.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-sm text-subtle",
					children: "Scegli barbiere e servizio per vedere il riepilogo."
				})
			]
		})]
	});
}
function Header({ kicker, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-[0.2em] text-accent",
			children: kicker
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-2 font-display text-3xl tracking-tight sm:text-4xl",
			children: title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-xl text-sm text-muted",
			children: copy
		})
	] });
}
function ServiceRow({ service, selected, onSelect, addon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelect,
		className: cn("flex items-start justify-between gap-4 rounded-xl border p-4 text-left transition-[border-color,background-color] duration-150", selected ? "border-accent bg-elevated" : "border-line bg-surface hover:border-line-strong"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl leading-none",
						children: service.name
					}), addon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-accent",
						children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block text-sm text-muted",
					children: service.description
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-2 block text-xs uppercase tracking-[0.14em] text-subtle",
					children: [service.duration_min, " min"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0 tabular-nums text-sm text-fg",
			children: formatEuro(service.price_cents)
		})]
	});
}
function Field({ label, htmlFor, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor,
			children: label
		}), children]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-subtle",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-right text-fg",
			children: v
		})]
	});
}
function Confirmation({ detail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg rounded-2xl border border-line bg-surface p-6 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-12 place-items-center rounded-full bg-accent/15 text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scissors, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-5 font-display text-3xl tracking-tight",
				children: "Sei in agenda."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					"Conserva il codice. Ti aspettiamo da ",
					detail.stylist_name,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 font-display text-4xl tracking-[0.14em] text-accent",
				children: detail.code
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-6 space-y-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Quando",
						v: `${formatDateLong(detail.appt_date)} · ${formatMinutes(detail.start_min)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Durata",
						v: `${detail.duration_min} minuti`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Servizi",
						v: detail.services.map((s) => s.service_name).join(", ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Totale",
						v: formatEuro(detail.total_cents)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/prenota",
						children: "Nuova prenotazione"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `/appuntamenti?code=${detail.code}`,
						children: "Vedi dettagli"
					})
				})]
			})
		]
	});
}
function PrenotaPage() {
	const { stylists, services } = Route$2.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { solid: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.22em] text-accent",
						children: "Prenotazione"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-4xl tracking-tight sm:text-5xl",
						children: "Prendi il tuo posto in bottega."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-sm text-muted",
						children: "Scegli il barbiere, il servizio, eventuali extra e l'orario libero. L'agenda blocca automaticamente i 30 o 60 minuti occupati."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingWizard, {
							stylists,
							services
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { PrenotaPage as component };
