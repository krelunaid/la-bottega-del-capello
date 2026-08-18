import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient, authEnabled, GROK_PROVIDERS, rememberSessionToken, signIn, signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUserState, type AppUser } from "@/lib/auth/use-current-user";
import { provisionStaffLogin, type StaffProfile } from "@/lib/staff-server";
import { staffOnce } from "@/lib/staff-cache";

type Search = { next?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    next: typeof s.next === "string" && s.next.startsWith("/") ? s.next : undefined,
  }),
  component: Login,
});

function splitName(display: string | null): { first: string; last: string } {
  const raw = (display ?? "").split(" · ")[0].trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" opacity=".85" />
      <path fill="currentColor" d="M5.84 14.11A6.93 6.93 0 0 1 5.48 12c0-.73.13-1.45.36-2.11V7.05H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84Z" opacity=".7" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51Z" opacity=".55" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M16.37 12.63c.03 3.23 2.83 4.31 2.86 4.32-.02.08-.45 1.54-1.47 3.05-.89 1.3-1.81 2.6-3.26 2.63-1.42.03-1.88-.84-3.5-.84-1.64 0-2.15.82-3.5.87-1.4.05-2.47-1.41-3.37-2.71-1.84-2.66-3.25-7.52-1.36-10.8.94-1.63 2.62-2.66 4.44-2.69 1.39-.03 2.7.93 3.5.93.8 0 2.3-1.15 3.88-.98.66.03 2.51.27 3.7 2.01-.1.06-2.21 1.29-2.18 3.85ZM14.7 6.4c.75-.91 1.26-2.17 1.12-3.43-1.08.04-2.39.72-3.17 1.63-.7.8-1.31 2.09-1.15 3.32 1.22.1 2.46-.62 3.2-1.52Z"
      />
    </svg>
  );
}

function Login() {
  const { next } = Route.useSearch();
  const dest = next || "/appuntamenti";
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [oauth, setOauth] = useState<string | null>(null);

  async function onOauth(id: string) {
    setError(null);
    setOauth(id);
    try {
      await signIn(id, { callbackURL: dest });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accesso non riuscito. Riprova.");
      setOauth(null);
    }
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "up") {
        if (name.trim().length < 2) throw new Error("Scrivi nome e cognome");
        if (password.length < 8) throw new Error("La password deve avere almeno 8 caratteri");
        const res = await authClient.signUp.email({ name: name.trim(), email: email.trim(), password });
        if (res.error) throw new Error(res.error.message || "Registrazione non riuscita");
        rememberSessionToken(res.data?.token);
        await authClient.getSession();
        window.location.assign(dest);
        return;
      }
      if (email.trim().toLowerCase() === "negozio@bottega.it") {
        const provisioned = await provisionStaffLogin({ data: { email: email.trim(), password } });
        if (provisioned.ok && provisioned.token) {
          rememberSessionToken(provisioned.token);
          await authClient.getSession();
          window.location.assign("/sala");
          return;
        }
      }
      const res = await authClient.signIn.email({ email: email.trim(), password });
      if (res.error) throw new Error(res.error.message === "Invalid password" || res.error.message === "User not found" ? "Email o password non corrette" : res.error.message || "Accesso non riuscito");
      rememberSessionToken(res.data?.token);
      await authClient.getSession();
      window.location.assign(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto");
    } finally {
      setPending(false);
    }
  }

  if (isPending) {
    return <p className="px-5 py-10 text-sm text-muted">Carico il profilo…</p>;
  }

  if (user) {
    return <AccountHome user={user} />;
  }

  return (
    <div className="px-5 py-5">
      <img src="/logo-lbc.png" alt="" className="h-8 w-auto" />
      <h1 className="mt-3 font-display text-4xl leading-none">Il tuo spazio</h1>
      <p className="mt-2 text-sm text-muted">
        Entra per vedere le prenotazioni e scrivere in chat. Prenotare si può anche senza account.
      </p>

      {authEnabled ? (
        <div className="mt-6 grid gap-2">
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              asChild
              variant={p.idp === "google" ? "default" : "outline"}
              size="lg"
              className="h-12 rounded-xl"
            >
              <a href={`/auth/popup?providerId=${encodeURIComponent(p.providerId)}`} target="_blank" rel="opener">
                {p.idp === "google" ? <GoogleMark /> : null}
                {p.idp === "apple" ? <AppleMark /> : null}
                Entra con {p.label}
              </a>
            </Button>
          ))}
        </div>
      ) : null}

      <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-subtle">
        <span className="h-px flex-1 bg-line-strong" />
        oppure email
        <span className="h-px flex-1 bg-line-strong" />
      </div>

      <form className="grid gap-3" onSubmit={(e) => void onEmail(e)}>
        {mode === "up" ? (
          <>
            <label className="grid gap-1.5">
              <Label htmlFor="lg-name">Nome e cognome</Label>
              <Input id="lg-name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </label>
            <label className="grid gap-1.5">
              <Label htmlFor="lg-phone">Telefono</Label>
              <Input
                id="lg-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="333 123 4567"
              />
            </label>
          </>
        ) : null}
        <label className="grid gap-1.5">
          <Label htmlFor="lg-email">Email</Label>
          <Input
            id="lg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="la.tua@email.it"
          />
        </label>
        <label className="grid gap-1.5">
          <Label htmlFor="lg-pass">Password</Label>
          <Input
            id="lg-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            required
            minLength={8}
            placeholder="Almeno 8 caratteri"
          />
        </label>
        {error ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p> : null}
        <Button type="submit" size="lg" className="h-12 rounded-xl" disabled={pending}>
          {pending ? "Attendi…" : mode === "up" ? "Crea account" : "Entra"}
        </Button>
      </form>

      <button
        type="button"
        className="mt-5 w-full text-center text-sm text-muted"
        onClick={() => {
          setMode((m) => (m === "in" ? "up" : "in"));
          setError(null);
        }}
      >
        {mode === "in" ? "Primo accesso? Registrati" : "Hai già un account? Entra"}
      </button>
    </div>
  );
}

function AccountHome({ user }: { user: AppUser }) {
  const initial = splitName(user.displayName);
  const [first, setFirst] = useState(initial.first);
  const [last, setLast] = useState(initial.last);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const full = `${first} ${last}`.trim();

  useEffect(() => {
    staffOnce()
      .then(setStaff)
      .catch(() => setStaff(null));
  }, []);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    if (full.length < 2) {
      toast.error("Inserisci almeno il nome");
      return;
    }
    setSaving(true);
    try {
      const res = await authClient.updateUser({ name: full });
      if (res.error) throw new Error(res.error.message || "Salvataggio non riuscito");
      await authClient.getSession();
      toast.success("Profilo aggiornato");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Non salvato");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-5 py-5">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-subtle">Profilo</p>
        <h1 className="mt-2 font-display text-3xl">{full || user.displayName || "Ospite"}</h1>
        {user.primaryEmail ? <p className="mt-1 text-sm text-muted">{user.primaryEmail}</p> : null}
      </div>

      <form className="mt-4 grid gap-3 rounded-2xl border border-line bg-surface p-5" onSubmit={(e) => void saveName(e)}>
        <p className="text-[11px] uppercase tracking-[0.18em] text-subtle">Come ti chiami</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <Label htmlFor="pf-first">Nome</Label>
            <Input id="pf-first" value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" />
          </label>
          <label className="grid gap-1.5">
            <Label htmlFor="pf-last">Cognome</Label>
            <Input id="pf-last" value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" />
          </label>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvo…" : "Salva nome"}
        </Button>
      </form>

      <div className="mt-4 grid gap-2">
        {staff ? (
          <Button asChild size="lg">
            <Link to="/sala" search={{}}>
              Agenda e chat
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="lg">
          <Link to="/appuntamenti">Le mie prenotazioni</Link>
        </Button>
        {authEnabled ? (
          <Button type="button" variant="ghost" size="lg" onClick={() => void signOut()}>
            Esci
          </Button>
        ) : null}
        <Link to="/legale" className="pt-2 text-center text-xs text-subtle underline">
          Privacy, cookie e condizioni
        </Link>
        <p className="pt-4 text-center text-[10px] uppercase tracking-[0.2em] text-subtle">by kreluna</p>
      </div>
    </div>
  );
}
