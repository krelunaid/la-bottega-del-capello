import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  formatDateLong,
  formatEuro,
  formatMinutes,
  type AppointmentDetail,
} from "@/lib/salon";
import { listMyAppointments, lookupAppointment } from "@/lib/salon-server";

type Search = { code?: string };

export const Route = createFileRoute("/appuntamenti")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    code: typeof search.code === "string" ? search.code : undefined,
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { code } = Route.useSearch();
  const navigate = useNavigate({ from: "/appuntamenti" });
  const { user, isPending } = useCurrentUserState();
  const [mine, setMine] = useState<AppointmentDetail[] | null>(null);
  const [query, setQuery] = useState(code ?? "");
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<AppointmentDetail | null | undefined>(undefined);
  const [looking, setLooking] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    listMyAppointments()
      .then(setMine)
      .catch(() => setMine([]));
  }, [user, isPending]);

  useEffect(() => {
    if (!code) return;
    setQuery(code);
    void runLookup(code, "");
  }, [code]);

  async function runLookup(nextCode: string, nextPhone: string) {
    setLooking(true);
    try {
      const row = await lookupAppointment({
        data: { code: nextCode, phone: nextPhone || undefined },
      });
      setFound(row);
    } catch {
      setFound(null);
    } finally {
      setLooking(false);
    }
  }

  return (
    <div className="px-4 py-5 sm:px-6">
      <p className="text-sm text-muted">
        Cerca col codice, oppure{" "}
        <Link to="/login" search={{ next: "/appuntamenti" }} className="text-accent">
          accedi
        </Link>
        .
      </p>

      <form
        className="mt-5 grid gap-3 rounded-xl border border-line bg-surface p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void navigate({ search: { code: query.trim() || undefined } });
          void runLookup(query, phone);
        }}
      >
        <label className="grid gap-1.5">
          <Label>Codice</Label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="BT-XXXXX"
          />
        </label>
        <label className="grid gap-1.5">
          <Label>Telefono (facoltativo)</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="333…" />
        </label>
        <Button type="submit" disabled={looking || query.trim().length < 3}>
          {looking ? "Cerco…" : "Cerca"}
        </Button>
      </form>

      {found === null ? (
        <p className="mt-6 text-sm text-muted">Nessun appuntamento con questi dati.</p>
      ) : found ? (
        <div className="mt-5">
          <AppointmentCard detail={found} />
        </div>
      ) : null}

      {user && mine ? (
        <div className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-subtle">Sul tuo account</p>
          {mine.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nessuna prenotazione sul tuo profilo.</p>
          ) : (
            <div className="mt-3 grid gap-3">
              {mine.map((row) => (
                <AppointmentCard key={row.id} detail={row} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function AppointmentCard({ detail }: { detail: AppointmentDetail }) {
  const statusLabel =
    detail.status === "cancelled"
      ? "Annullato"
      : detail.status === "done"
        ? "Completato"
        : "Confermato";
  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl tracking-[0.08em] text-accent">{detail.code}</p>
          <p className="mt-1 text-sm text-fg">
            {formatDateLong(detail.appt_date)} · {formatMinutes(detail.start_min)}
          </p>
          <p className="text-sm text-muted">
            {detail.stylist_name} · {detail.duration_min} min
          </p>
        </div>
        <Badge variant={detail.status === "cancelled" ? "muted" : "default"}>{statusLabel}</Badge>
      </div>
      <ul className="mt-4 space-y-1 text-sm text-muted">
        {detail.services.map((s) => (
          <li key={s.service_id} className="flex justify-between gap-3">
            <span>{s.service_name}</span>
            <span className="tabular-nums text-fg">{formatEuro(s.price_cents)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-right text-sm tabular-nums">{formatEuro(detail.total_cents)}</p>
    </article>
  );
}
