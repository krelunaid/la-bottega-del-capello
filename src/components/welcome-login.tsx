import { useEffect, useState, type FormEvent } from "react";
import { authClient, authEnabled, GROK_PROVIDERS, getBearerToken, rememberSessionToken } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { provisionStaffLogin } from "@/lib/staff-server";

export const GUEST_KEY = "lbc-guest";

export function isGuest(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(GUEST_KEY) === "1";
  } catch {
    return false;
  }
}

export function setGuest() {
  try {
    window.localStorage.setItem(GUEST_KEY, "1");
    window.sessionStorage.setItem("lbc-open", "1");
    window.localStorage.setItem("lbc-open", "1");
    window.dispatchEvent(new Event("lbc-open"));
  } catch {
    /* ignore */
  }
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

function markOpen() {
  try {
    window.sessionStorage.setItem("lbc-open", "1");
    window.localStorage.setItem("lbc-open", "1");
    window.dispatchEvent(new Event("lbc-open"));
  } catch {
    /* ignore */
  }
}

export function WelcomeLogin({ onGuest, onAuthed }: { onGuest?: () => void; onAuthed?: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [waiting, setWaiting] = useState<"google" | "x" | null>(null);

  function finish() {
    markOpen();
    onAuthed?.();
  }

  function takeToken() {
    const token = getBearerToken();
    if (!token) return false;
    rememberSessionToken(token);
    void authClient.getSession().catch(() => undefined);
    finish();
    return true;
  }

  useEffect(() => {
    if (takeToken()) return;
    const tick = () => {
      if (getBearerToken()) takeToken();
    };
    const id = window.setInterval(tick, 150);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    const onMsg = (event: MessageEvent) => {
      const data = event.data as { source?: string; token?: string | null } | undefined;
      if (!data || data.source !== "grok-auth-popup" || !data.token) return;
      rememberSessionToken(data.token);
      void authClient.getSession().catch(() => undefined);
      finish();
    };
    window.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", tick);
    window.addEventListener("storage", tick);
    window.addEventListener("message", onMsg);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", tick);
      window.removeEventListener("storage", tick);
      window.removeEventListener("message", onMsg);
    };
  }, []);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const mail = email.trim().toLowerCase();
    const pass = password;
    const display = name.trim() || mail.split("@")[0] || "Cliente";
    try {
      if (mail === "negozio@bottega.it") {
        const provisioned = await provisionStaffLogin({ data: { email: mail, password: pass } });
        if (provisioned.ok && provisioned.token) {
          rememberSessionToken(provisioned.token);
          await authClient.getSession();
          finish();
          window.location.assign("/sala");
          return;
        }
      }
      const existing = await authClient.signIn.email({ email: mail, password: pass });
      if (!existing.error) {
        rememberSessionToken(existing.data?.token);
        await authClient.getSession();
        finish();
        return;
      }
      if (pass.length < 8) throw new Error("Password di almeno 8 caratteri");
      const created = await authClient.signUp.email({ name: display, email: mail, password: pass });
      if (created.error) {
        const msg = created.error.message || "";
        if (/already|exist|registr/i.test(msg)) throw new Error("Email o password non corrette");
        throw new Error(msg || "Accesso non riuscito");
      }
      rememberSessionToken(created.data?.token);
      await authClient.getSession();
      finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="relative h-[26%] shrink-0 overflow-hidden">
        <img src="/images/hero.jpg" alt="" className="h-full w-full object-cover object-[center_42%]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-10 pt-7">
        <h1 className="text-center font-display text-5xl leading-none">Entra</h1>

        {authEnabled ? (
          <div className="mt-8 grid gap-3">
            {GROK_PROVIDERS.map((p) => (
              <a
                key={p.providerId}
                href={`/auth/popup?providerId=${encodeURIComponent(p.providerId)}`}
                target="_blank"
                rel="opener"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent text-base font-medium text-accent-fg first:bg-accent [&:nth-child(2)]:border [&:nth-child(2)]:border-line-strong [&:nth-child(2)]:bg-transparent [&:nth-child(2)]:text-fg"
                onClick={(e) => {
                  const url = `/auth/popup?providerId=${encodeURIComponent(p.providerId)}`;
                  const popup = window.open(url, `lbc-${p.providerId}`, "popup,width=480,height=720");
                  if (popup) e.preventDefault();
                  setWaiting(p.idp === "google" ? "google" : "x");
                }}
              >
                {p.idp === "google" ? <GoogleMark /> : null}
                Continua con {p.label}
              </a>
            ))}
          </div>
        ) : null}

        {waiting ? (
          <div className="mt-4 rounded-2xl bg-elevated px-4 py-3 text-center">
            <p className="text-sm text-muted">
              Scegli l’account {waiting === "google" ? "Google" : "X"} nell’altra pagina. Poi torna qui.
            </p>
            <button type="button" className="mt-3 h-11 w-full rounded-xl bg-accent text-sm font-medium text-accent-fg" onClick={() => takeToken() || setError("Non ancora. Finisci l’accesso e riprova.")}>
              Ho scelto l’account
            </button>
          </div>
        ) : null}

        <form className="mt-8 grid gap-3" onSubmit={(e) => void onEmail(e)}>
          <p className="text-center text-[11px] uppercase tracking-[0.16em] text-subtle">oppure email</p>
          <label className="grid gap-1.5">
            <Label htmlFor="w-name">Nome e cognome</Label>
            <Input id="w-name" className="h-12 text-base" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="grid gap-1.5">
            <Label htmlFor="w-email">Email</Label>
            <Input id="w-email" type="email" className="h-12 text-base" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="grid gap-1.5">
            <Label htmlFor="w-pass">Password</Label>
            <Input id="w-pass" type="password" className="h-12 text-base" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="current-password" />
          </label>
          {error ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p> : null}
          <Button type="submit" size="lg" className="h-14 rounded-2xl" disabled={pending}>
            {pending ? "Attendi…" : "Entra"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-6 py-3 text-center text-sm text-subtle"
          onClick={() => {
            setGuest();
            onGuest?.();
          }}
        >
          Entra senza account
        </button>
      </div>
    </div>
  );
}
