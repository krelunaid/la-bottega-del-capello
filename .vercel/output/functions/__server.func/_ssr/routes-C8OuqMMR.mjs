import { o as formatEuro, t as SALON } from "./salon-mJRWrfSy.mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Phone, o as MapPin, r as Scissors, s as Clock, u as ArrowRight } from "../_libs/lucide-react.mjs";
import { i as Route$5 } from "./router-CV76N2Cg.mjs";
import { t as Button } from "./button-hKQYUImO.mjs";
import { t as SiteHeader } from "./site-header-BlD6xSLZ.mjs";
import { t as SiteFooter } from "./site-footer-7XdDHdaL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C8OuqMMR.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { stylists, services } = Route$5.useLoaderData();
	const primaries = services.filter((s) => s.is_primary);
	const extras = services.filter((s) => s.is_addon);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Story, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Team, { stylists }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Services, {
					primaries,
					extras
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Visit, {})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Hero() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/hero.jpg",
				alt: "Interno de La Bottega del Capello",
				className: "h-full w-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-bg/25" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.28em] text-accent",
					children: "Chiesanuova · Pistoia"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl",
					children: "L'arte del barbering, su misura per te."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 max-w-lg text-base text-fg/80 sm:text-lg",
					children: [SALON.tagline, " Prenota con Stefano, Mario, Simone o Daniele. Trenta o sessanta minuti: se un posto è occupato, il successivo parte alla fine di quei minuti."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/prenota",
							children: ["Prenota il tuo posto", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: SALON.whatsappHref,
							children: "WhatsApp"
						})
					})]
				})
			]
		})]
	});
}
function Story() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-accent",
				children: "Dal 1977"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-4xl tracking-tight sm:text-5xl",
				children: "Dove tradizione e innovazione si incontrano."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-muted",
				children: "La Bottega Del Capello nasce dalla passione per l'arte del barbering. Linee pulite, dettagli sartoriali e l'attenzione autentica di un tempo: ogni visita è pensata per andare oltre il semplice taglio."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-8 grid gap-3 text-sm text-fg",
				children: [
					"Prodotti premium, strumenti professionali",
					"Ambiente riservato, stile 100% italiano",
					"Agenda reale: se Stefano è occupato 30 minuti, il prossimo posto è alla fine di quei 30"
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scissors, { className: "mt-0.5 size-4 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
				}, item))
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/tools.jpg",
				alt: "Strumenti da barbiere",
				className: "h-64 w-full rounded-xl object-cover sm:h-80"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/wash.jpg",
				alt: "Angolo lavaggio",
				className: "mt-8 h-64 w-full rounded-xl object-cover sm:h-80"
			})]
		})]
	});
}
function Team({ stylists }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-y border-line bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-20 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.22em] text-accent",
					children: "Il nostro team"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-4xl tracking-tight",
					children: "Quattro professionisti, un solo standard."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: stylists.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl border border-line bg-bg p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-14 place-items-center rounded-full bg-elevated font-display text-xl text-accent",
								children: s.initials
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-5 font-display text-2xl leading-tight",
								children: s.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs uppercase tracking-[0.16em] text-muted",
								children: s.role
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: s.bio
							})
						]
					}, s.id))
				})
			]
		})
	});
}
function Services({ primaries, extras }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-6xl px-4 py-20 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.22em] text-accent",
					children: "Listino"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-4xl tracking-tight",
					children: "Servizi e tempi."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/prenota",
						children: "Prenota un servizio"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 grid gap-3",
				children: primaries.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col justify-between gap-2 rounded-xl border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl",
						children: s.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: s.description
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-6 text-sm tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-subtle",
							children: [s.duration_min, " min"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatEuro(s.price_cents) })]
					})]
				}, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 text-xs uppercase tracking-[0.18em] text-subtle",
				children: "Da aggiungere al taglio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: extras.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-xl border border-line px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: s.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-subtle",
						children: [s.duration_min, " min"]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm tabular-nums",
						children: formatEuro(s.price_cents)
					})]
				}, s.id))
			})
		]
	});
}
function Visit() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-t border-line bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					icon: MapPin,
					title: "Dove siamo",
					body: `${SALON.address}\n${SALON.city}`,
					href: SALON.mapsHref
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					icon: Clock,
					title: "Orari",
					body: "Mar–Ven 8:30–13:00 / 15:30–20:00\nSabato 8:00–19:00\nDom e Lun chiusi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					icon: Phone,
					title: "Contatti",
					body: SALON.phone,
					href: SALON.phoneHref
				})
			]
		})
	});
}
function Info({ icon: Icon, title, body, href }) {
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-accent" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mt-4 font-display text-2xl",
			children: title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 whitespace-pre-line text-sm text-muted",
			children: body
		})
	] });
	return href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href,
		className: "block hover:text-fg",
		children: content
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: content });
}
//#endregion
export { Home as component };
