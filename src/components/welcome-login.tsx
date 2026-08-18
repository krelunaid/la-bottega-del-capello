import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { authClient, authEnabled, GROK_PROVIDERS, getBearerToken, rememberSessionToken } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function markOpen() {
  try {
    window.sessionStorage.setItem("lbc-open", "1");
    window.localStorage.setItem("lbc-open", "1");
    window.dispatchEvent(new Event("lbc-open"));
  } catch {
    /* ignore */
  }
}

function providerWait(idp: string): "google" | "x" | "apple" {
  if (idp === "apple") return "apple";
  if (idp === "google") return "google";
  return "x";
}

function providerClass(idp: string): string {
  if (idp === "google") return "bg-accent text-accent-fg";
  if (idp === "apple") return "bg-fg text-bg";
  return "border border-line-strong bg-transparent text-fg";
}

export function WelcomeLogin({ onGuest, onAuthed }: { onGuest?: () => void; onAuthed?: () => void }) {
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [waiting, setWaiting] = useState<"google" | "x" | "apple" | null>(null);

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
    const id = waiting ? window.setInterval(tick, 250) : undefined;
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
      if (id) window.clearInterval(id);
      window.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", tick);
      window.removeEventListener("storage", tick);
      window.removeEventListener("message", onMsg);
    };
  }, [waiting]);

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (name.trim().length < 2) throw new Error("Scrivi nome e cognome");
      if (password.length < 8) throw new Error("Password di almeno 8 caratteri");
      const created = await authClient.signUp.email({ name: name.trim(), email: email.trim(), password });
      if (created.error) throw new Error(created.error.message || "Registrazione non riuscita");
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
      <div className="relative h-[32%] shrink-0 overflow-hidden">
        <img src="/images/hero.jpg" alt="" className="h-full w-full object-cover object-[center_42%]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-10 pt-8">
        <h1 className="text-center font-display text-5xl leading-none">Entra</h1>

        {authEnabled ? (
          <div className="mt-10 grid gap-3">
            {GROK_PROVIDERS.map((p) => (
              <a
                key={p.providerId}
                href={`/auth/popup?providerId=${encodeURIComponent(p.providerId)}`}
                target="_blank"
                rel="opener"
                className={`inline-flex h-14 items-center justify-center gap-2 rounded-2xl text-base font-medium ${providerClass(p.idp)}`}
                onClick={(e) => {
                  const url = `/auth/popup?providerId=${encodeURIComponent(p.providerId)}`;
                  const popup = window.open(url, `lbc-${p.providerId}`, "popup,width=480,height=720");
                  if (popup) e.preventDefault();
                  setWaiting(providerWait(p.idp));
                }}
              >
                {p.idp === "google" ? <GoogleMark /> : null}
                {p.idp === "apple" ? <AppleMark /> : null}
                Entra con {p.label}
              </a>
            ))}
          </div>
        ) : null}

        {waiting ? (
          <div className="mt-4 rounded-2xl bg-elevated px-4 py-3 text-center">
            <p className="text-sm text-muted">Scegli l’account nell’altra pagina. Poi torna qui.</p>
            <button
              type="button"
              className="mt-3 h-11 w-full rounded-xl bg-accent text-sm font-medium text-accent-fg"
              onClick={() => takeToken() || setError("Non ancora. Finisci l’accesso e riprova.")}
            >
              Ho scelto l’account
            </button>
          </div>
        ) : null}

        {signup ? (
          <form className="mt-8 grid gap-3" onSubmit={(e) => void onRegister(e)}>
            <label className="grid gap-1.5">
              <Label htmlFor="w-name">Nome e cognome</Label>
              <Input id="w-name" className="h-12 text-base" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="grid gap-1.5">
              <Label htmlFor="w-email">Email</Label>
              <Input id="w-email" type="email" className="h-12 text-base" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="grid gap-1.5">
              <Label htmlFor="w-pass">Password</Label>
              <Input id="w-pass" type="password" className="h-12 text-base" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </label>
            {error ? <p className="rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p> : null}
            <Button type="submit" size="lg" className="h-14 rounded-2xl" disabled={pending}>
              {pending ? "Attendi…" : "Registrati"}
            </Button>
            <button type="button" className="text-sm text-muted" onClick={() => setSignup(false)}>
              Indietro
            </button>
          </form>
        ) : (
          <button type="button" className="mt-8 text-center text-sm text-fg" onClick={() => setSignup(true)}>
            Se non hai un account, registrati
          </button>
        )}

        {error && !signup ? <p className="mt-3 text-center text-sm text-danger">{error}</p> : null}

        <button
          type="button"
          className="mt-auto pt-8 text-center text-sm text-subtle"
          onClick={() => {
            setGuest();
            onGuest?.();
          }}
        >
          Entra senza account
        </button>
        <Link to="/legale" className="mt-2 text-center text-xs text-subtle underline">
          Privacy, cookie e condizioni
        </Link>
        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-subtle">by kreluna</p>
      </div>
    </div>
  );
}
