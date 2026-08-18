import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { appUrl, qrImageUrl } from "@/lib/pwa";

export const Route = createFileRoute("/qr")({ component: QrPage });

function QrPage() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(appUrl()), []);
  const src = url ? qrImageUrl(url, 520) : "";

  return (
    <div className="px-5 py-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-subtle">Scarica l’app</p>
      <h1 className="mt-2 font-display text-3xl">QR da mettere in salone</h1>
      <p className="mt-2 text-sm text-muted">
        Il cliente inquadra e si apre la pagina Installa. Su Android parte da sola. Su iPhone sono due tap (Apple non
        lascia di più).
      </p>
      <div className="mx-auto mt-6 max-w-sm rounded-3xl bg-[#f3eee6] p-5">
        {src ? (
          <img src={src} alt="QR La Bottega del Capello" className="mx-auto w-full max-w-[280px]" />
        ) : null}
        <p className="mt-3 text-center font-display text-2xl text-[#110e0c]">LBC</p>
        <p className="text-center text-xs text-[#6e655c]">{url || "…"}</p>
      </div>
      <div className="mt-5 grid gap-2">
        <Button asChild>
          <a href={src} download="bottega-qr.png" target="_blank" rel="noreferrer">
            Scarica il QR
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={url || "/"}>Apri l’app</a>
        </Button>
      </div>
      <ol className="mt-8 space-y-2 text-sm text-muted">
        <li>1. Stampa il QR e mettilo in cassa o in vetrina.</li>
        <li>2. Il cliente scansiona con la fotocamera.</li>
        <li>3. Android: Installa. iPhone: Condividi → Aggiungi a Home.</li>
      </ol>
    </div>
  );
}
