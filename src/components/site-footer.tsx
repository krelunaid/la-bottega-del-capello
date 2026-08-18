import { Link } from "@tanstack/react-router";
import { SALON } from "@/lib/salon";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl tracking-tight">{SALON.name}</p>
          <p className="mt-2 text-sm text-muted">{SALON.tagline}</p>
          <p className="mt-4 max-w-xs text-sm text-subtle">
            Tradizione italiana, cura artigianale. Un ambiente riservato nel cuore
            di Chiesanuova.
          </p>
        </div>
        <div className="text-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">Salone</p>
          <p className="mt-3 text-fg">{SALON.address}</p>
          <p className="text-muted">{SALON.city}</p>
          <a href={SALON.phoneHref} className="mt-3 block text-fg hover:text-accent">
            {SALON.phone}
          </a>
          <p className="mt-3 text-muted">{SALON.hoursLabel}</p>
        </div>
        <div className="text-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">Naviga</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/prenota" className="text-fg hover:text-accent">
              Prenota un appuntamento
            </Link>
            <Link to="/chat" className="text-fg hover:text-accent">
              Chat con il salone
            </Link>
            <Link to="/appuntamenti" className="text-fg hover:text-accent">
              Le tue prenotazioni
            </Link>
            <a href={SALON.instagram} className="text-fg hover:text-accent">
              Instagram
            </a>
            <a href={SALON.facebook} className="text-fg hover:text-accent">
              Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-4 py-5 text-center text-xs text-subtle">
        Chiusi domenica e lunedì · {SALON.name}
      </div>
    </footer>
  );
}
