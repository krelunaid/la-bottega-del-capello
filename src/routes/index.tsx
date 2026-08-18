import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { formatEuro, SALON, stylistPhoto, type Service, type Stylist } from "@/lib/salon";
import { listServices, listStylists } from "@/lib/salon-server";
import { Portrait } from "@/components/portrait";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { hasAuthHint } from "@/lib/auth/client";
import { WelcomeLogin } from "@/components/welcome-login";

function alreadyIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return hasAuthHint() || window.localStorage.getItem("lbc-open") === "1";
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { user } = useCurrentUserState();
  const [guest, setGuestMode] = useState(false);
  const [entered, setEntered] = useState(alreadyIn);

  useEffect(() => {
    if (hasAuthHint()) setEntered(true);
    try {
      if (window.localStorage.getItem("lbc-open") === "1") setEntered(true);
    } catch {
      /* ignore */
    }
    const on = () => setEntered(true);
    window.addEventListener("lbc-open", on);
    return () => window.removeEventListener("lbc-open", on);
  }, []);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const ready = Boolean(user) || guest || entered;
  const primaries = services.filter((s) => s.is_primary);
  const extras = services.filter((s) => s.is_addon);

  useEffect(() => {
    if (!ready) return;
    let on = true;
    Promise.all([listStylists(), listServices()])
      .then(([a, b]) => {
        if (!on) return;
        setStylists(a);
        setServices(b);
      })
      .catch(() => undefined);
    return () => {
      on = false;
    };
  }, [ready]);

  if (!user && !guest && !entered) {
    return <WelcomeLogin onGuest={() => setGuestMode(true)} onAuthed={() => setEntered(true)} />;
  }

  return (
    <div className="pb-4">
      <section className="relative">
        <img
          src="/images/hero.jpg"
          alt="Interno de La Bottega del Capello"
          className="h-[46svh] w-full object-cover object-[center_42%]"
          fetchPriority="high"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-bg/20" />
        <div className="relative z-10 -mt-24 px-4 pb-2">
          <div className="glass rounded-2xl px-5 py-4">
            <p className="section-kicker text-accent">Chiesanuova · Pistoia</p>
            <h1 className="mt-2 font-display text-[2.4rem] leading-[0.9]">
              {user ? `Ciao${user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}.` : "Su misura per te."}
            </h1>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to="/prenota"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-accent text-base font-medium text-accent-fg"
              >
                Prenota
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/chat"
                className="inline-flex h-14 items-center justify-center rounded-xl border border-fg/20 bg-fg/5 text-base font-medium"
              >
                Chat
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 py-7">
        <p className="section-kicker">Il team</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {stylists.map((s) => (
            <Link key={s.id} to="/prenota" className="relative overflow-hidden rounded-2xl">
              <Portrait
                src={stylistPhoto(s)}
                initials={s.initials}
                alt={s.name}
                className="aspect-[4/5] w-full object-cover text-3xl"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent px-3 pb-3 pt-10">
                <p className="font-display text-[1.7rem] leading-none">{s.name.split(" ")[0]}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-accent">{s.role}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="section-kicker mt-10">Listino</p>
        <div className="glass mt-3 overflow-hidden rounded-2xl">
          {primaries.map((s, i) => (
            <ServiceRow key={s.id} service={s} last={i === primaries.length - 1} />
          ))}
        </div>

        <p className="section-kicker mt-8">Extra</p>
        <div className="glass mt-3 overflow-hidden rounded-2xl">
          {extras.map((s, i) => (
            <ServiceRow key={s.id} service={s} last={i === extras.length - 1} />
          ))}
        </div>

        <div className="mt-10 space-y-2 text-sm text-muted">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 text-accent" />
            {SALON.address}, {SALON.city}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="size-4 text-accent" />
            {SALON.hoursLabel}
          </p>
          <a href={SALON.phoneHref} className="flex items-center gap-2 text-fg">
            <Phone className="size-4 text-accent" />
            {SALON.phone}
          </a>
          <Link to="/legale" className="pt-3 text-xs text-subtle underline">
            Privacy, cookie e condizioni
          </Link>
          <p className="pt-4 text-center text-[10px] uppercase tracking-[0.2em] text-subtle">by kreluna</p>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ service, last }: { service: Service; last: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 px-4 py-3.5 ${last ? "" : "border-b border-line"}`}>
      <div className="min-w-0">
        <p className="font-display text-lg leading-tight">{service.name}</p>
        <p className="mt-0.5 text-xs text-muted">{service.duration_min} min</p>
      </div>
      <p className="shrink-0 tabular-nums text-sm">{formatEuro(service.price_cents)}</p>
    </div>
  );
}
