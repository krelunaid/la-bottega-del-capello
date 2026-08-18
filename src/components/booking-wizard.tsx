import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, Plus, Scissors, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  addDaysIso,
  combinedDuration,
  formatDateLong,
  formatEuro,
  formatMinutes,
  isOpenDay,
  monthGrid,
  todayInRome,
  stylistPhoto,
  type AppointmentDetail,
  type Service,
  type Stylist,
} from "@/lib/salon";
import { bookAppointment, getAvailability } from "@/lib/salon-server";
import { notifyAgenda } from "@/lib/live";
import { Portrait } from "@/components/portrait";

const STEPS = ["Barbiere", "Servizio", "Extra", "Orario", "Conferma"] as const;

type Props = {
  stylists: Stylist[];
  services: Service[];
  shopMode?: boolean;
};

export function BookingWizard({ stylists, services, shopMode = false }: Props) {
  const [step, setStep] = useState(0);
  const [stylistId, setStylistId] = useState<string | null>(null);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [date, setDate] = useState<string>(() => {
    let d = todayInRome();
    for (let i = 0; i < 14; i += 1) {
      if (isOpenDay(d)) return d;
      d = addDaysIso(d, 1);
    }
    return d;
  });
  const [monthCursor, setMonthCursor] = useState(() => {
    const t = todayInRome();
    return { y: Number(t.slice(0, 4)), m: Number(t.slice(5, 7)) - 1 };
  });
  const [startMin, setStartMin] = useState<number | null>(null);
  const [slots, setSlots] = useState<number[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<AppointmentDetail | null>(null);

  const primaries = services.filter((s) => s.is_primary);
  const extras = services.filter((s) => s.id !== primaryId);
  const selected = useMemo(() => {
    const ids = [primaryId, ...addonIds].filter(Boolean) as string[];
    return ids
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is Service => Boolean(s));
  }, [primaryId, addonIds, services]);

  const duration = combinedDuration(selected.length ? selected : [{ duration_min: 30 }]);
  const total = selected.reduce((sum, s) => sum + s.price_cents, 0);
  const stylist = stylists.find((s) => s.id === stylistId) ?? null;

  useEffect(() => {
    if (!stylistId || step !== 3) return;
    let cancelled = false;
    setLoadingSlots(true);
    setStartMin(null);
    getAvailability({ data: { stylistId, date, duration } })
      .then((res) => {
        if (cancelled) return;
        setSlots(res.slots);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stylistId, date, duration, step]);

  function toggleAddon(id: string) {
    setAddonIds((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]));
  }

  function canNext(): boolean {
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
      const detail = await bookAppointment({
        data: {
          stylistId,
          serviceIds: [primaryId, ...addonIds],
          date,
          startMin,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim(),
          notes: notes.trim(),
        },
      });
      setDone(detail);
      notifyAgenda();
      toast.success(shopMode ? "Cliente in agenda" : "Appuntamento confermato");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Prenotazione non riuscita");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <Confirmation detail={done} shopMode={shopMode} />;
  }

  const cells = monthGrid(monthCursor.y, monthCursor.m);
  const monthLabel = new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(monthCursor.y, monthCursor.m, 1)));

  return (
    <div className="min-w-0 overflow-x-hidden">
      <ol className="mb-6 grid grid-cols-5 gap-1">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i <= step && setStep(i)}
              className={cn(
                "flex h-11 w-full flex-col items-center justify-center rounded-lg px-0.5 text-center",
                i === step
                  ? "bg-accent text-accent-fg"
                  : i < step
                    ? "bg-elevated text-fg"
                    : "text-subtle",
              )}
            >
              <span className="text-[10px] tabular-nums leading-none">{i + 1}</span>
              <span className="mt-0.5 max-w-full truncate text-[9px] uppercase tracking-wide">
                {label}
              </span>
            </button>
          </li>
        ))}
      </ol>

        {step === 0 ? (
          <section>
            <Header
              kicker={shopMode ? "In sala" : "Il tuo barbiere"}
              title={shopMode ? "Per chi prenoti?" : "Con chi vuoi prenotare?"}
              copy={shopMode ? "Scegli il barbiere e inserisci il cliente." : "Quattro mani, un solo standard. Scegli chi ti segue."}
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {stylists.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStylistId(s.id);
                    setStartMin(null);
                    setStep(1);
                  }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-[border-color,background-color] duration-150",
                    stylistId === s.id
                      ? "border-accent bg-elevated"
                      : "border-line bg-surface hover:border-line-strong",
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <Portrait
                      src={stylistPhoto(s)}
                      initials={s.initials}
                      alt={s.name}
                      className="size-12 shrink-0 rounded-full object-cover text-lg"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-display text-xl leading-tight">{s.name}</span>
                      <span className="mt-0.5 block text-xs uppercase tracking-[0.14em] text-muted">
                        {s.role}
                      </span>
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted">{s.bio}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section>
            <Header
              kicker="Il servizio"
              title="Cosa ti serve oggi?"
              copy="Scegli il servizio principale. Subito dopo potrai aggiungere barba e extra."
            />
            <div className="mt-6 grid gap-3">
              {primaries.map((s) => (
                <ServiceRow
                  key={s.id}
                  service={s}
                  selected={primaryId === s.id}
                  onSelect={() => {
                    setPrimaryId(s.id);
                    setAddonIds((ids) => ids.filter((id) => id !== s.id));
                    setStep(2);
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <Header
              kicker="Altri servizi"
              title="Vuoi aggiungere altro?"
              copy="Tocca un extra e vai avanti. Se ne vuoi un altro, torna indietro."
            />
            {selected.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {selected.map((s) => (
                  <Badge key={s.id}>
                    {s.name}
                    {s.id !== primaryId ? (
                      <button
                        type="button"
                        className="ml-1 inline-flex"
                        onClick={() => toggleAddon(s.id)}
                        aria-label={`Rimuovi ${s.name}`}
                      >
                        <X className="size-3" />
                      </button>
                    ) : null}
                  </Badge>
                ))}
              </div>
            ) : null}
            <div className="mt-5 grid gap-2">
              {extras.map((s) => (
                <ServiceRow
                  key={s.id}
                  service={s}
                  selected={addonIds.includes(s.id)}
                  onSelect={() => {
                    const adding = !addonIds.includes(s.id);
                    toggleAddon(s.id);
                    if (adding) setStep(3);
                  }}
                  addon
                />
              ))}
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-line py-3 text-sm text-muted"
              onClick={() => setStep(3)}
            >
              No, basta il servizio già scelto
            </button>
          </section>
        ) : null}

        {step === 3 ? (
          <section>
            <Header
              kicker="Data e ora"
              title={`Quando vieni da ${stylist?.name.split(" ")[0] ?? "noi"}?`}
              copy="Scegli il giorno e l'orario libero: quelli già presi non si vedono."
            />
            <div className="mt-6 rounded-xl border border-line bg-surface p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="shrink-0 text-sm text-muted"
                  onClick={() =>
                    setMonthCursor((c) =>
                      c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 },
                    )
                  }
                >
                  ‹
                </button>
                <p className="min-w-0 truncate text-center font-display text-lg capitalize sm:text-xl">
                  {monthLabel}
                </p>
                <button
                  type="button"
                  className="shrink-0 text-sm text-muted"
                  onClick={() =>
                    setMonthCursor((c) =>
                      c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 },
                    )
                  }
                >
                  ›
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-subtle">
                {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((iso, i) => {
                  if (!iso) return <div key={`e-${i}`} />;
                  const open = isOpenDay(iso);
                  const past = iso < todayInRome();
                  const selectedDay = iso === date;
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!open || past}
                      onClick={() => setDate(iso)}
                      className={cn(
                        "grid aspect-square place-items-center rounded-md text-sm tabular-nums",
                        selectedDay && "bg-accent text-accent-fg",
                        !selectedDay && open && !past && "text-fg hover:bg-elevated",
                        (!open || past) && "text-subtle/50",
                      )}
                    >
                      {Number(iso.slice(8))}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-subtle">Chiusi domenica e lunedì. Pausa pranzo mar–ven 13:00–15:30.</p>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-subtle">
                Disponibilità · {formatDateLong(date)} · {duration} min
              </p>
              {loadingSlots ? (
                <p className="mt-4 text-sm text-muted">Controllo l'agenda…</p>
              ) : slots.length === 0 ? (
                <p className="mt-4 text-sm text-muted">
                  Nessuno spazio libero in questo giorno. Prova un'altra data.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setStartMin(t);
                        setStep(4);
                      }}
                      className={cn(
                        "h-11 rounded-md border text-sm tabular-nums",
                        startMin === t
                          ? "border-accent bg-accent text-accent-fg"
                          : "border-line bg-surface text-fg hover:border-line-strong",
                      )}
                    >
                      {formatMinutes(t)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section>
            <Header
              kicker={shopMode ? "Il cliente" : "I tuoi dati"}
              title={shopMode ? "Chi viene?" : "Conferma la prenotazione"}
              copy={shopMode ? "Nome e telefono di chi si siede in poltrona." : "Controlla i servizi. Puoi ancora aggiungerne prima di confermare."}
            />
            <ul className="mt-5 grid gap-2">
              {selected.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm"
                >
                  <span className="min-w-0 truncate">{s.name}</span>
                  <span className="shrink-0 tabular-nums">{formatEuro(s.price_cents)}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent/50 py-3 text-sm text-accent"
              onClick={() => setStep(2)}
            >
              <Plus className="size-4" />
              Aggiungi un altro servizio
            </button>
            <div className="mt-6 grid gap-4">
              <Field label={shopMode ? "Nome del cliente" : "Nome e cognome"} htmlFor="bk-name">
                <Input
                  id="bk-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder={shopMode ? "Es. Luca Bianchi" : "Mario Rossi"}
                />
              </Field>
              <Field label="Telefono" htmlFor="bk-phone">
                <Input
                  id="bk-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="333 123 4567"
                />
              </Field>
              <Field label="Email (facoltativa)" htmlFor="bk-email">
                <Input
                  id="bk-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  type="email"
                  placeholder="mario@email.it"
                />
              </Field>
              <Field label="Note per il barbiere" htmlFor="bk-notes">
                <Textarea
                  id="bk-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferenze, lunghezza, primo taglio…"
                />
              </Field>
            </div>
          </section>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="shrink-0"
          >
            <ChevronLeft />
            Indietro
          </Button>
          {step === 4 ? (
            <Button type="button" onClick={() => void confirm()} disabled={!canNext() || submitting}>
              {submitting ? "Prenoto…" : "Conferma"}
            </Button>
          ) : (
            <span />
          )}
        </div>

      <aside className="mt-8 min-w-0 rounded-2xl border border-line bg-surface p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-subtle">Il tuo appuntamento</p>
        <div className="mt-4 space-y-3 text-sm">
          <Row k="Barbiere" v={stylist?.name ?? "—"} />
          <Row
            k="Servizi"
            v={
              selected.length
                ? selected.map((s) => s.name).join(", ")
                : "—"
            }
          />
          <Row k="Durata" v={`${duration} minuti`} />
          <Row k="Quando" v={startMin !== null ? `${formatDateLong(date)} · ${formatMinutes(startMin)}` : formatDateLong(date)} />
          <Row k="Totale" v={selected.length ? formatEuro(total) : "—"} />
        </div>
        {selected.length ? (
          <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            {selected.map((s) => (
              <li key={s.id} className="flex justify-between gap-3 text-muted">
                <span>{s.name}</span>
                <span className="tabular-nums text-fg">{formatEuro(s.price_cents)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm text-subtle">Scegli barbiere e servizio per vedere il riepilogo.</p>
        )}
      </aside>
    </div>
  );
}

function Header({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-accent">{kicker}</p>
      <h2 className="mt-2 font-display text-[1.75rem] leading-[1.05] tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-xl text-sm text-muted">{copy}</p>
    </div>
  );
}

function ServiceRow({
  service,
  selected,
  onSelect,
  addon,
}: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
  addon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full min-w-0 items-start justify-between gap-3 rounded-xl border p-4 text-left transition-[border-color,background-color] duration-150",
        selected ? "border-accent bg-elevated" : "border-line bg-surface hover:border-line-strong",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className="min-w-0 font-display text-lg leading-tight sm:text-xl">{service.name}</span>
          {addon ? (
            <span className="text-accent">
              {selected ? <Check className="size-4" /> : <Plus className="size-4" />}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-sm text-muted">{service.description}</span>
        <span className="mt-2 block text-xs uppercase tracking-[0.14em] text-subtle">
          {service.duration_min} min
        </span>
      </span>
      <span className="shrink-0 tabular-nums text-sm text-fg">{formatEuro(service.price_cents)}</span>
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-subtle">{k}</span>
      <span className="min-w-0 text-right break-words text-fg">{v}</span>
    </div>
  );
}

function Confirmation({ detail, shopMode }: { detail: AppointmentDetail; shopMode?: boolean }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="grid size-12 place-items-center rounded-full bg-accent/15 text-accent">
        <Scissors className="size-5" />
      </div>
      <h2 className="mt-5 font-display text-3xl tracking-tight">
        {shopMode ? "Cliente in agenda." : "Sei in agenda."}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {shopMode
          ? `${detail.customer_name} da ${detail.stylist_name}. Codice ${detail.code}.`
          : `Conserva il codice. Ti aspettiamo da ${detail.stylist_name}.`}
      </p>
      <p className="mt-6 font-display text-4xl tracking-[0.14em] text-accent">{detail.code}</p>
      <dl className="mt-6 space-y-2 text-sm">
        <Row k="Quando" v={`${formatDateLong(detail.appt_date)} · ${formatMinutes(detail.start_min)}`} />
        <Row k="Durata" v={`${detail.duration_min} minuti`} />
        <Row k="Servizi" v={detail.services.map((s) => s.service_name).join(", ")} />
        <Row k="Totale" v={formatEuro(detail.total_cents)} />
      </dl>
      <div className="mt-8 flex flex-col gap-2">
        {shopMode ? (
          <>
            <Button asChild>
              <a href="/sala">Vedi in agenda</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/prenota">Altro cliente</a>
            </Button>
          </>
        ) : (
          <>
            <Button asChild>
              <a href="/prenota">Nuova prenotazione</a>
            </Button>
            <Button asChild variant="outline">
              <a href={`/appuntamenti?code=${detail.code}`}>Vedi dettagli</a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
