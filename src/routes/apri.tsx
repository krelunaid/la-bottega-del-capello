import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SALON } from "@/lib/salon";
import {
  canNativeInstall,
  deviceKind,
  isStandalone,
  openIosAddHome,
  promptInstall,
  subscribeInstall,
} from "@/lib/pwa";

export const Route = createFileRoute("/apri")({ component: ApriPage });

function ApriPage() {
  const [kind, setKind] = useState<"ios" | "ipad" | "android" | "other">("other");
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setKind(deviceKind());
    setInstalled(isStandalone());
    setReady(canNativeInstall());
    return subscribeInstall(() => setReady(canNativeInstall()));
  }, []);

  useEffect(() => {
    if (kind !== "android" || !ready || installed) return;
    const t = window.setTimeout(() => {
      void promptInstall().then((r) => {
        if (r === "accepted") setInstalled(true);
        setReady(canNativeInstall());
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, [kind, ready, installed]);

  async function installIos() {
    setBusy(true);
    setNote(null);
    const ok = await openIosAddHome();
    setBusy(false);
    if (ok) {
      setNote("Nel foglio che si è aperto tocca «Aggiungi a Home».");
      return;
    }
    setNote(
      kind === "ipad"
        ? "Tocca Condividi in alto, poi «Aggiungi a Home»."
        : "Tocca Condividi in basso, poi «Aggiungi a Home».",
    );
  }

  async function install() {
    setBusy(true);
    setNote(null);
    const result = await promptInstall();
    setBusy(false);
    if (result === "accepted") {
      setInstalled(true);
      setNote("App installata. Aprila dalla Home.");
      return;
    }
    if (result === "unavailable") {
      setNote(
        kind === "android"
          ? "Apri questo link in Chrome. Poi il tasto Installa compare da solo."
          : "Su iPhone e iPad Apple non lascia installare da sola. Usa il tasto sotto.",
      );
      return;
    }
    setNote("Installazione annullata. Riprova quando vuoi.");
  }

  const apple = kind === "ios" || kind === "ipad";

  if (installed) {
    return (
      <div className="px-5 py-8 text-center">
        <img src="/icons/icon-192.png" alt="" className="mx-auto size-20 rounded-3xl" />
        <h1 className="mt-5 font-display text-4xl">Ce l’hai.</h1>
        <p className="mt-2 text-sm text-muted">Apri {SALON.name} dalla Home, come le altre app.</p>
        <Button asChild size="lg" className="mt-6 h-12 rounded-xl">
          <Link to="/">Entra</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 py-6">
      <img src="/icons/icon-192.png" alt="" className="size-16 rounded-2xl" />
      <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-subtle">iPhone · Android · iPad</p>
      <h1 className="mt-2 font-display text-4xl leading-none">L’app in Home</h1>
      <p className="mt-2 text-sm text-muted">
        {kind === "android"
          ? "Su Android Google la mette in Home come un’app. Un tap."
          : kind === "ipad"
            ? "Su iPad: Condividi → Aggiungi a Home. Poi è un’app a tutto schermo."
            : kind === "ios"
              ? "Su iPhone: tocca il tasto, poi «Aggiungi a Home»."
              : "Funziona su iPhone, Android e iPad. Apri questo link dal telefono o dal tablet."}
      </p>

      {apple ? (
        <div className="mt-6 grid gap-3">
          <Button size="lg" className="h-14 rounded-xl text-base" disabled={busy} onClick={() => void installIos()}>
            {busy ? "Apro…" : "Aggiungi a Home"}
          </Button>
          <p className="text-center text-xs text-subtle">
            {kind === "ipad"
              ? "Si apre il menu di iPad. Lì tocca «Aggiungi a Home»."
              : "Si apre il menu di iPhone. Lì tocca «Aggiungi a Home»."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-2">
          <Button size="lg" className="h-14 rounded-xl text-base" disabled={busy} onClick={() => void install()}>
            {busy ? "Installo…" : "Installa l’app"}
          </Button>
          {kind === "android" && !ready ? (
            <p className="text-center text-xs text-subtle">Se il tasto non parte, apri questa pagina in Chrome.</p>
          ) : null}
        </div>
      )}

      {note ? <p className="mt-4 rounded-xl bg-elevated px-3 py-2 text-sm text-muted">{note}</p> : null}

      <Button asChild variant="outline" size="lg" className="mt-6 h-12 w-full rounded-xl">
        <Link to="/">Usa subito senza installare</Link>
      </Button>
    </div>
  );
}
