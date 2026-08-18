import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { authClient, rememberSessionToken } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import {
  addDaysIso,
  formatDateLong,
  formatEuro,
  formatMinutes,
  isOpenDay,
  todayInRome,
  stylistPhoto,
  type AppointmentDetail,
  type Service,
  type ServiceCategory,
  type Stylist,
} from "@/lib/salon";
import {
  deleteService,
  getSalonMedia,
  listUpcomingAppointments,
  listAllServicesAdmin,
  listStylists,
  saveSalonMedia,
  saveService,
  saveStylistPhoto,
  updateAppointmentStatus,
  type SalonMedia,
} from "@/lib/salon-server";
import { getStaffProfile, provisionStaffLogin, type StaffProfile } from "@/lib/staff-server";
import { appUrl, qrImageUrl } from "@/lib/pwa";
import { compressImage, notifyMediaChanged } from "@/lib/media";
import { Portrait } from "@/components/portrait";
import { listChatMessages, listStaffConversations, staffReply } from "@/lib/chat-server";
import { AGENDA_EVENT, notifyAgenda } from "@/lib/live";
import { ChatThread } from "@/components/chat-thread";
import { formatChatDay, type ChatMessage, type Conversation } from "@/lib/chat";

export const Route = createFileRoute("/sala")({
  validateSearch: (s: Record<string, unknown>): { tab?: "chat" | "listino" | "foto" | "agenda" | "qr" } => {
    if (s.tab === "chat" || s.tab === "listino" || s.tab === "foto" || s.tab === "agenda" || s.tab === "qr") {
      return { tab: s.tab };
    }
    return {};
  },
  component: SalaPage,
});

function SalaPage() {
  const { user, isPending } = useCurrentUserState();
  const [staff, setStaff] = useState<StaffProfile | null | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      setStaff(null);
      return;
    }
    getStaffProfile()
      .then(setStaff)
      .catch(() => setStaff(null));
  }, [user]);

  if (isPending || (user && staff === undefined)) {
    return <div className="px-5 py-10 text-sm text-muted">Apro…</div>;
  }
  if (staff) return <SalaDesk staff={staff} />;
  return <StaffLogin onReady={() => window.location.assign("/sala")} />;
}

function StaffLogin({ onReady }: { onReady: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function enter(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const provisioned = await provisionStaffLogin({ data: { email, password } });
      if (!provisioned.ok) throw new Error("Accesso non riuscito");
      if (provisioned.token) rememberSessionToken(provisioned.token);
      await authClient.getSession();
      onReady();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Accesso non riuscito");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-5 py-10">
      <h1 className="font-display text-3xl">Accesso</h1>
      <form className="mt-6 grid gap-3" onSubmit={(e) => void enter(e)}>
        <label className="grid gap-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="grid gap-1.5">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? "Attendi…" : "Entra"}
        </Button>
      </form>
    </div>
  );
}

function SalaDesk({ staff }: { staff: StaffProfile }) {
  const { tab: tabFromUrl } = Route.useSearch();
  const [tab, setTab] = useState<"agenda" | "listino" | "chat" | "foto" | "qr">(tabFromUrl ?? "agenda");

  useEffect(() => {
    if (tabFromUrl) setTab(tabFromUrl);
  }, [tabFromUrl]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDetail[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [agendaError, setAgendaError] = useState<string | null>(null);

  async function reloadAgenda() {
    try {
      const rows = await listUpcomingAppointments();
      setAppointments(rows);
      setAgendaError(null);
    } catch (err) {
      setAppointments([]);
      setAgendaError(err instanceof Error ? err.message : "Agenda non disponibile");
    }
  }
  async function reloadServices() {
    setServices(await listAllServicesAdmin());
  }

  useEffect(() => {
    listStylists().then(setStylists).catch(() => setStylists([]));
  }, []);

  useEffect(() => {
    let on = true;
    const tick = () => {
      if (document.hidden) return;
      listUpcomingAppointments()
        .then((rows) => {
          if (!on) return;
          setAppointments((prev) => {
            const a = prev.map((x) => `${x.id}:${x.status}:${x.start_min}`).join("|");
            const b = rows.map((x) => `${x.id}:${x.status}:${x.start_min}`).join("|");
            return a === b ? prev : rows;
          });
          setAgendaError(null);
        })
        .catch((err) => {
          if (on) setAgendaError(err instanceof Error ? err.message : "Agenda non disponibile");
        });
    };
    tick();
    const id = window.setInterval(tick, 2500);
    window.addEventListener(AGENDA_EVENT, tick);
    return () => {
      on = false;
      window.clearInterval(id);
      window.removeEventListener(AGENDA_EVENT, tick);
    };
  }, []);
  useEffect(() => {
    if (tab === "listino") reloadServices().catch(() => setServices([]));
  }, [tab]);

  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <p className="text-sm text-muted">Ciao {staff.name.split(" ")[0]}.</p>
        <div className="flex gap-2 overflow-x-auto">
          <TabBtn active={tab === "agenda"} onClick={() => setTab("agenda")}>
            Agenda
          </TabBtn>
          <TabBtn active={tab === "chat"} onClick={() => setTab("chat")}>
            Chat
          </TabBtn>
          <TabBtn active={tab === "listino"} onClick={() => setTab("listino")}>
            Listino
          </TabBtn>
          <TabBtn active={tab === "foto"} onClick={() => setTab("foto")}>
            Foto
          </TabBtn>
          <TabBtn active={tab === "qr"} onClick={() => setTab("qr")}>
            QR
          </TabBtn>
        </div>
      </div>
      {tab === "agenda" ? (
        <Agenda
          stylists={stylists}
          appointments={appointments}
          error={agendaError}
          onChange={() => void reloadAgenda()}
        />
      ) : tab === "chat" ? (
        <StaffInbox />
      ) : tab === "listino" ? (
        <Listino services={services} onChange={() => void reloadServices()} />
      ) : tab === "foto" ? (
        <FotoStudio stylists={stylists} onStylists={setStylists} />
      ) : (
        <QrShare />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-full px-4 text-sm",
        active ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function weekDays(anyIso: string): string[] {
  const d = new Date(`${anyIso}T12:00:00Z`);
  const pad = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - pad);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setUTCDate(d.getUTCDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

function Agenda({
  stylists,
  appointments,
  error,
  onChange,
}: {
  stylists: Stylist[];
  appointments: AppointmentDetail[];
  error: string | null;
  onChange: () => void;
}) {
  const today = todayInRome();
  const [date, setDate] = useState(today);
  const [who, setWho] = useState("tutti");
  const week = weekDays(date);

  const filtered = appointments.filter((a) => (who === "tutti" ? true : a.stylist_id === who));
  const dayRows = filtered
    .filter((a) => a.appt_date === date)
    .slice()
    .sort((a, b) => a.start_min - b.start_min || a.stylist_name.localeCompare(b.stylist_name));

  return (
    <section className="mt-6">
      <p className="font-display text-3xl">Agenda</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setWho("tutti")}
          className={cn(
            "col-span-2 h-11 rounded-xl text-sm",
            who === "tutti" ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
          )}
        >
          Tutto il team
        </button>
        {stylists.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setWho(s.id)}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-xl px-2 text-sm",
              who === s.id ? "bg-accent text-accent-fg" : "bg-elevated text-fg",
            )}
          >
            <Portrait
              src={stylistPhoto(s)}
              initials={s.initials}
              alt={s.name}
              className="size-7 shrink-0 rounded-full object-cover text-[10px]"
            />
            <span className="truncate">{s.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button type="button" className="text-sm text-muted" onClick={() => setDate(addDaysIso(week[0], -7))}>
          Settimana prima
        </button>
        <button type="button" className="text-sm text-muted" onClick={() => setDate(today)}>
          Oggi
        </button>
        <button type="button" className="text-sm text-muted" onClick={() => setDate(addDaysIso(week[0], 7))}>
          Dopo
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {week.map((iso) => {
          const closed = !isOpenDay(iso);
          const count = filtered.filter((a) => a.appt_date === iso && a.status !== "cancelled").length;
          const selected = iso === date;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setDate(iso)}
              className={cn(
                "rounded-lg py-2 text-center",
                selected ? "bg-accent text-accent-fg" : "bg-elevated text-fg",
                closed && !selected && "opacity-40",
              )}
            >
              <span className="block text-[10px] uppercase tracking-wide">
                {new Date(`${iso}T12:00:00Z`).toLocaleDateString("it-IT", { weekday: "short" })}
              </span>
              <span className="block text-sm tabular-nums">{Number(iso.slice(8))}</span>
              <span className="block text-[10px] opacity-70">{count || "·"}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-5 font-display text-2xl capitalize">{formatDateLong(date)}</p>
      {!isOpenDay(date) ? <p className="mt-2 text-sm text-muted">Salone chiuso.</p> : null}
      <DayList rows={dayRows} onChange={onChange} />
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </section>
  );
}

function DayList({ rows, onChange }: { rows: AppointmentDetail[]; onChange: () => void }) {
  if (rows.length === 0) {
    return <p className="mt-3 text-sm text-subtle">Nessun appuntamento in questo giorno.</p>;
  }
  return (
    <ul className="mt-3 grid gap-2">
      {rows.map((a) => (
        <li
          key={a.id}
          className={cn(
            "rounded-xl border border-line bg-surface px-4 py-3",
            a.status === "cancelled" && "opacity-50",
            a.status === "done" && "border-ok/30",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm tabular-nums text-accent">
                {formatMinutes(a.start_min)}–{formatMinutes(a.start_min + a.duration_min)}
                <span className="ml-2 text-subtle">{a.stylist_name}</span>
              </p>
              <p className="mt-0.5 text-sm">{a.customer_name}</p>
              <p className="text-xs text-muted">
                {a.services.map((x) => x.service_name).join(" + ")} · {a.customer_phone}
              </p>
            </div>
            <Badge variant="muted">
              {a.status === "cancelled" ? "Annullato" : a.status === "done" ? "Fatto" : "In agenda"}
            </Badge>
          </div>
          {a.status === "confirmed" ? (
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                className="text-xs text-muted"
                onClick={() =>
                  updateAppointmentStatus({ data: { id: a.id, status: "done" } })
                    .then(() => {
                      notifyAgenda();
                      onChange();
                    })
                    .catch((err) => toast.error(String(err)))
                }
              >
                Fatto
              </button>
              <button
                type="button"
                className="text-xs text-muted"
                onClick={() =>
                  updateAppointmentStatus({ data: { id: a.id, status: "cancelled" } })
                    .then(() => {
                      notifyAgenda();
                      onChange();
                    })
                    .catch((err) => toast.error(String(err)))
                }
              >
                Annulla
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Listino({ services, onChange }: { services: Service[]; onChange: () => void }) {
  const [editing, setEditing] = useState<Service | null | "new">(null);
  return (
    <section className="mt-6">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          Nuovo servizio
        </Button>
      </div>
      {editing ? (
        <ServiceEditor
          initial={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChange();
          }}
        />
      ) : null}
      <ul className="mt-4 grid gap-2">
        {services.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm">{s.name}</p>
              <p className="text-xs text-subtle">
                {s.duration_min} min · {s.active ? "attivo" : "nascosto"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm tabular-nums">{formatEuro(s.price_cents)}</span>
              <button type="button" className="text-xs text-muted" onClick={() => setEditing(s)}>
                Modifica
              </button>
              <button
                type="button"
                className="text-xs text-muted"
                onClick={() =>
                  deleteService({ data: { id: s.id } })
                    .then(onChange)
                    .catch((err) => toast.error(String(err)))
                }
              >
                Nascondi
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ServiceEditor({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: Service;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(
    initial ? String((initial.price_cents / 100).toFixed(2)).replace(".", ",") : "",
  );
  const [duration, setDuration] = useState<30 | 60>(initial?.duration_min ?? 30);
  const [category, setCategory] = useState<ServiceCategory>(initial?.category ?? "hair");
  const [isPrimary, setIsPrimary] = useState(initial?.is_primary ?? true);
  const [isAddon, setIsAddon] = useState(initial?.is_addon ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [sort, setSort] = useState(String(initial?.sort ?? 20));
  const [saving, setSaving] = useState(false);

  async function save() {
    const euro = Number(price.replace(",", "."));
    if (!name.trim() || Number.isNaN(euro)) {
      toast.error("Nome e prezzo sono obbligatori");
      return;
    }
    setSaving(true);
    try {
      await saveService({
        data: {
          id: initial?.id,
          name: name.trim(),
          description: description.trim(),
          priceEuro: euro,
          durationMin: duration,
          category,
          isPrimary,
          isAddon,
          active,
          sort: Number(sort) || 20,
        },
      });
      toast.success("Listino aggiornato");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Salvataggio non riuscito");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="mt-4 grid gap-3 rounded-xl border border-line bg-elevated p-4"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="grid gap-1.5">
          <Label>Prezzo (€)</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
        </label>
      </div>
      <label className="grid gap-1.5">
        <Label>Descrizione</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="flex gap-2">
        {([30, 60] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDuration(d)}
            className={cn(
              "h-11 flex-1 rounded-md border text-sm",
              duration === d ? "border-accent bg-accent text-accent-fg" : "border-line bg-bg",
            )}
          >
            {d} min
          </button>
        ))}
      </div>
      <select
        className="h-11 rounded-md border border-line bg-bg px-3 text-sm"
        value={category}
        onChange={(e) => setCategory(e.target.value as ServiceCategory)}
      >
        <option value="hair">Capelli</option>
        <option value="beard">Barba</option>
        <option value="treatment">Trattamento</option>
        <option value="addon">Altro extra</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
        Servizio principale
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isAddon} onChange={(e) => setIsAddon(e.target.checked)} />
        Extra
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Visibile
      </label>
      <Input value={sort} onChange={(e) => setSort(e.target.value)} inputMode="numeric" />
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Salvo…" : "Salva"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annulla
        </Button>
      </div>
    </form>
  );
}

function StaffInbox() {
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let on = true;
    const tick = () => {
      listStaffConversations()
        .then((rows) => {
          if (on) setThreads(rows);
        })
        .catch(() => undefined);
    };
    tick();
    const id = window.setInterval(tick, 3000);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let on = true;
    const tick = () => {
      listChatMessages({ data: { conversationId: activeId } })
        .then((rows) => {
          if (on) setMessages(rows);
        })
        .catch(() => undefined);
    };
    tick();
    const id = window.setInterval(tick, 2500);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, [activeId]);

  async function reply() {
    if (!activeId || !draft.trim()) return;
    setSending(true);
    try {
      const next = await staffReply({ data: { conversationId: activeId, body: draft.trim() } });
      setMessages(next);
      setDraft("");
      setThreads(await listStaffConversations());
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-6 grid gap-3">
      <ul className="grid gap-2">
        {threads.length === 0 ? <li className="text-sm text-subtle">Nessun messaggio.</li> : null}
        {threads.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => setActiveId(t.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-left",
                activeId === t.id ? "border-accent bg-elevated" : "border-line bg-surface",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium">{t.guest_name}</span>
                {t.unread_staff > 0 ? (
                  <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] text-accent-fg">
                    {t.unread_staff}
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block truncate text-xs text-muted">{t.last_body || "—"}</span>
              <span className="mt-1 block text-[10px] text-subtle">{formatChatDay(t.last_message_at)}</span>
            </button>
          </li>
        ))}
      </ul>
      {activeId ? (
        <div className="flex min-h-[360px] flex-col rounded-xl border border-line p-3">
          <ChatThread
            messages={messages}
            draft={draft}
            onDraft={setDraft}
            onSend={() => void reply()}
            sending={sending}
            placeholder="Rispondi…"
            perspective="shop"
          />
        </div>
      ) : null}
    </section>
  );
}

function FotoStudio({
  stylists,
  onStylists,
}: {
  stylists: Stylist[];
  onStylists: (rows: Stylist[]) => void;
}) {
  const [media, setMedia] = useState<SalonMedia>({ logo: null, hero: null });
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    getSalonMedia()
      .then(setMedia)
      .catch(() => setMedia({ logo: null, hero: null }));
  }, []);

  async function pickFile(file: File | undefined, kind: "logo" | "hero" | string) {
    if (!file) return;
    setBusy(kind);
    try {
      const dataUrl = await compressImage(file, kind === "logo" ? 640 : kind === "hero" ? 1400 : 900);
      if (kind === "logo" || kind === "hero") {
        await saveSalonMedia({ data: { key: kind, value: dataUrl } });
        setMedia((m) => ({ ...m, [kind]: dataUrl }));
        notifyMediaChanged();
      } else {
        await saveStylistPhoto({ data: { id: kind, photoUrl: dataUrl } });
        onStylists(stylists.map((s) => (s.id === kind ? { ...s, photo_url: dataUrl } : s)));
      }
      toast.success("Foto salvata");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Caricamento non riuscito");
    } finally {
      setBusy(null);
    }
  }

  async function clear(kind: "logo" | "hero" | string) {
    setBusy(kind);
    try {
      if (kind === "logo" || kind === "hero") {
        await saveSalonMedia({ data: { key: kind, value: null } });
        setMedia((m) => ({ ...m, [kind]: null }));
        notifyMediaChanged();
      } else {
        await saveStylistPhoto({ data: { id: kind, photoUrl: null } });
        onStylists(stylists.map((s) => (s.id === kind ? { ...s, photo_url: null } : s)));
      }
      toast.success("Foto rimossa");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Non rimossa");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-6 grid gap-4">
      <MediaCard
        title="Logo"
        hint="Solo lettere"
        preview={media.logo}
        initials="LBC"
        busy={busy === "logo"}
        onPick={(f) => void pickFile(f, "logo")}
        onClear={() => void clear("logo")}
      />
      <MediaCard
        title="Copertina"
        hint="Home"
        preview={media.hero}
        initials="—"
        wide
        busy={busy === "hero"}
        onPick={(f) => void pickFile(f, "hero")}
        onClear={() => void clear("hero")}
      />
      {stylists.map((s) => (
        <MediaCard
          key={s.id}
          title={s.name}
          hint={s.role}
          preview={stylistPhoto(s)}
          initials={s.initials}
          busy={busy === s.id}
          onPick={(f) => void pickFile(f, s.id)}
          onClear={() => void clear(s.id)}
        />
      ))}
    </section>
  );
}

function MediaCard({
  title,
  hint,
  preview,
  initials,
  wide,
  busy,
  onPick,
  onClear,
}: {
  title: string;
  hint: string;
  preview: string | null | undefined;
  initials: string;
  wide?: boolean;
  busy: boolean;
  onPick: (file?: File) => void;
  onClear: () => void;
}) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
      <Portrait
        src={preview}
        initials={initials}
        alt={title}
        className={wide ? "h-16 w-24 shrink-0 rounded-lg" : "size-16 shrink-0 rounded-full"}
      />
      <div className="min-w-0 flex-1">
        <p className="font-display text-xl leading-tight">{title}</p>
        <p className="text-xs text-muted">{hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex h-9 cursor-pointer items-center rounded-full bg-accent px-4 text-sm text-accent-fg">
            {busy ? "Salvo…" : preview ? "Cambia" : "Carica"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                onPick(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
            />
          </label>
          {preview ? (
            <button type="button" className="h-9 rounded-full px-4 text-sm text-muted" disabled={busy} onClick={onClear}>
              Rimuovi
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function QrShare() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(appUrl()), []);
  const src = url ? qrImageUrl(url, 640) : "";
  return (
    <section className="mt-6">
      <p className="font-display text-3xl">QR dell’app</p>
      <p className="mt-2 text-sm text-muted">Uno solo. Inquadra e si apre l’app.</p>
      <div className="mx-auto mt-5 max-w-xs rounded-3xl bg-[#f3eee6] p-5">
        {src ? <img src={src} alt="QR app" className="mx-auto w-full" /> : null}
        <p className="mt-3 text-center font-display text-2xl text-[#110e0c]">LBC</p>
      </div>
      <div className="mt-4 grid gap-2">
        <Button asChild>
          <a href="/qr">Stampa</a>
        </Button>
      </div>
    </section>
  );
}
