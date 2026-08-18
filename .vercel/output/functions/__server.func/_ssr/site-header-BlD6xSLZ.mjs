import { t as SALON } from "./salon-mJRWrfSy.mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut, t as authClient } from "./client-bdin7QIH.mjs";
import { n as cn } from "./button-hKQYUImO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-header-BlD6xSLZ.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled (default) -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
function SiteHeader({ solid = false }) {
	const { user, isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: cn("sticky top-0 z-40 border-b border-line/70 backdrop-blur-md", solid ? "bg-bg/95" : "bg-bg/70"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "group flex min-w-0 items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/images/crest.jpg",
					alt: "",
					className: "size-9 rounded-full object-cover sm:size-10"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate font-display text-lg leading-none tracking-tight text-fg sm:text-xl",
						children: SALON.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden text-[10px] uppercase tracking-[0.22em] text-muted sm:block",
						children: "Gentleman Barber"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex shrink-0 items-center gap-0.5 sm:gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/appuntamenti",
						className: "hidden h-10 items-center rounded-full px-3 text-sm text-muted hover:text-fg lg:inline-flex",
						children: "Appuntamenti"
					}),
					isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-8 animate-pulse rounded-full bg-elevated" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/sala",
							className: "hidden h-10 items-center rounded-full px-3 text-sm text-muted hover:text-fg sm:inline-flex",
							children: "Sala"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void signOut(),
							className: "hidden h-10 items-center rounded-full px-3 text-sm text-muted hover:text-fg md:inline-flex",
							children: "Esci"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "hidden h-10 items-center rounded-full px-3 text-sm text-muted hover:text-fg sm:inline-flex",
						children: "Staff"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/prenota",
						className: "inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90",
						children: "Prenota"
					})
				]
			})]
		})
	});
}
//#endregion
export { useCurrentUserState as n, SiteHeader as t };
