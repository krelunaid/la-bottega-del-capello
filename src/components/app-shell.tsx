import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Home, MessageCircle, Scissors, UserRound } from "lucide-react";
import { SALON } from "@/lib/salon";
import { staffOnce } from "@/lib/staff-cache";
import { registerPwa } from "@/lib/pwa";
import { cn } from "@/lib/utils";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isGuest } from "@/components/welcome-login";

type ShopSearch = { tab?: "chat" | "listino" | "foto" | "agenda" };
const CUSTOMER_TABS: { to: string; label: string; icon: typeof Home; search?: ShopSearch }[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/prenota", label: "Prenota", icon: Scissors },
  { to: "/appuntamenti", label: "I miei", icon: CalendarDays },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/login", label: "Account", icon: UserRound },
];

const SHOP_TABS: { to: string; label: string; icon: typeof Home; search?: ShopSearch }[] = [
  { to: "/sala", label: "Agenda", icon: CalendarDays },
  { to: "/prenota", label: "Prenota", icon: Scissors },
  { to: "/sala", search: { tab: "chat" }, label: "Chat", icon: MessageCircle },
  { to: "/login", label: "Account", icon: UserRound },
];

const TITLES: Record<string, string> = {
  "/": SALON.name,
  "/prenota": "Prenota",
  "/appuntamenti": "I miei",
  "/chat": "Chat",
  "/login": "Account",
  "/sala": "Sala",
  "/qr": "QR",
  "/apri": "Installa",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchTab = useRouterState({
    select: (s) => (s.location.search as { tab?: string }).tab,
  });
  const fill = pathname === "/chat";
  const home = pathname === "/";
  const title = TITLES[pathname] ?? SALON.name;
  const { user } = useCurrentUserState();
  const [guest, setGuest] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return (
        isGuest() ||
        window.localStorage.getItem("lbc-open") === "1" ||
        window.sessionStorage.getItem("lbc-open") === "1"
      );
    } catch {
      return false;
    }
  });
  const [shop, setShop] = useState(false);
  const welcome = home && !user && !guest;

  useEffect(() => {
    const sync = () => {
      try {
        setGuest(
          isGuest() ||
            window.sessionStorage.getItem("lbc-open") === "1" ||
            window.localStorage.getItem("lbc-open") === "1",
        );
      } catch {
        setGuest(isGuest());
      }
    };
    sync();
    window.addEventListener("lbc-open", sync);
    return () => window.removeEventListener("lbc-open", sync);
  }, [pathname]);

  useEffect(() => {
    registerPwa();
  }, []);

  useEffect(() => {
    staffOnce()
      .then((s) => setShop(Boolean(s)))
      .catch(() => setShop(false));
  }, []);

  const tabs = shop ? SHOP_TABS : CUSTOMER_TABS;

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[860px] flex-col bg-bg text-fg md:max-w-[720px] lg:max-w-[780px]">
      {welcome ? null : (
      <header
        className={cn(
          "absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-4",
          home ? "pointer-events-none bg-transparent" : "glass-thin",
        )}
        style={{
          height: "calc(3.5rem + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <img src="/logo-lbc.png" alt="LBC" className="h-7 w-auto object-contain drop-shadow" />
        {home ? null : (
          <p className="min-w-0 truncate font-display text-xl leading-none tracking-tight">
            {shop && pathname === "/prenota" ? "Prenota cliente" : title}
          </p>
        )}
      </header>
      )}

      <div
        className={cn(
          "min-h-0 flex-1",
          welcome
            ? "overflow-hidden"
            : fill
              ? "flex flex-col overflow-hidden pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(6.25rem+env(safe-area-inset-bottom))]"
              : "overflow-y-auto overscroll-y-contain pb-[calc(6.25rem+env(safe-area-inset-bottom))]",
          !welcome && !home && !fill && "pt-[calc(3.5rem+env(safe-area-inset-top))]",
        )}
      >
        {children}
      </div>

      {welcome ? null : (
      <nav
        className="glass absolute inset-x-3 bottom-3 z-40 grid rounded-2xl pb-[env(safe-area-inset-bottom)]"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const active =
            tab.to === "/sala"
              ? pathname === "/sala" && (tab.search?.tab === "chat" ? searchTab === "chat" : searchTab !== "chat")
              : tab.to === "/"
                ? pathname === "/"
                : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={`${tab.to}-${tab.search?.tab ?? "x"}`}
              to={tab.to}
              search={tab.search}
              preload="intent"
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] uppercase tracking-[0.14em] transition-colors duration-150",
                active ? "text-fg" : "text-subtle",
              )}
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full transition-colors duration-150",
                  active && "bg-accent/20",
                )}
              >
                <Icon className={cn("size-4", active && "text-accent")} />
              </span>
              {tab.label}
            </Link>
          );
        })}
      </nav>
      )}
    </div>
  );
}
