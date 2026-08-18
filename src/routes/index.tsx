import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEuro, SALON, stylistPhoto, type Service } from "@/lib/salon";
import { listServices, listStylists } from "@/lib/salon-server";
import { Portrait } from "@/components/portrait";

export const Route = createFileRoute("/")({
  staleTime: 60_000,
  loader: async () => {
    const [stylists, services] = await Promise.all([listStylists(), listServices()]);
    return { stylists, services };
  },
  component: Home,
});

function Home() {
  const { stylists, services } = Route.useLoaderData();
  const primaries = services.filter((s) => s.is_primary);
  const extras = services.filter((s) => s.is_addon);

  return (
    <div>
      <section className="relative">
        <img
          src="/images/hero.jpg"
          alt="Interno de La Bottega del Capello"
          className="h-[58svh] w-full object-cover object-[center_58%]"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-bg/20" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-5">
          <div className="glass rounded-2xl px-5 py-4">
            <p className="section-kicker text-accent">Chiesanuova · Pistoia</p>
            <h1 className="mt-2 font-display text-[2.6rem] leading-[0.9]">Su misura per te.</h1>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild size="lg" className="h-12 rounded-xl">
                <Link to="/prenota" preload="intent">
                  Prenota
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-fg/20 bg-fg/5">
                <Link to="/chat">Chat</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 py-7">
        <p className="section-kicker">Il team</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {stylists.map((s) => (
            <Link key={s.id} to="/prenota" className="group relative overflow-hidden rounded-2xl">
              <Portrait
                src={stylistPhoto(s)}
                initials={s.initials}
                alt={s.name}
                className="aspect-[4/5] w-full object-cover text-3xl transition-transform duration-300 group-active:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent px-3 pb-3 pt-10">
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

        <div className="glass mt-8 mb-2 grid gap-4 rounded-2xl p-5">
          <a href={SALON.mapsHref} className="flex gap-3">
            <MapPin className="mt-0.5 size-4 text-accent" />
            <span className="text-sm">
              {SALON.address}
              <br />
              <span className="text-muted">{SALON.city}</span>
            </span>
          </a>
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-4 text-accent" />
            <span className="text-sm text-muted">{SALON.hoursLabel}</span>
          </div>
          <a href={SALON.phoneHref} className="flex gap-3">
            <Phone className="mt-0.5 size-4 text-accent" />
            <span className="text-sm">{SALON.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ service, last }: { service: Service; last?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3.5 ${last ? "" : "border-b border-line"}`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm">{service.name}</p>
        <p className="text-xs text-subtle">{service.duration_min} min</p>
      </div>
      <p className="shrink-0 text-sm tabular-nums">{formatEuro(service.price_cents)}</p>
    </div>
  );
}
