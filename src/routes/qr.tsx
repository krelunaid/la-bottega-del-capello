import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { appUrl, qrImageUrl } from "@/lib/pwa";

export const Route = createFileRoute("/qr")({ component: QrPage });

function QrPage() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(appUrl()), []);
  const src = url ? qrImageUrl(url, 720) : "";

  return (
    <div className="px-5 py-6">
      <div className="print:hidden">
        <p className="text-[11px] uppercase tracking-[0.18em] text-subtle">Da stampare</p>
        <h1 className="mt-2 font-display text-3xl">Il QR dell’app</h1>
        <p className="mt-2 text-sm text-muted">Uno solo. Il cliente inquadra e si apre l’app.</p>
        <div className="mt-5 grid gap-2">
          <Button type="button" className="h-12 rounded-xl" onClick={() => window.print()}>
            Stampa
          </Button>
          {src ? (
            <Button asChild variant="outline">
              <a href={src} download="lbc-app.png" target="_blank" rel="noreferrer">
                Scarica il QR
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <article className="mx-auto mt-8 max-w-sm overflow-hidden rounded-3xl bg-[#f3eee6] p-6 text-[#110e0c]">
        <p className="text-center text-[10px] uppercase tracking-[0.22em] text-[#6e655c]">La Bottega del Capello</p>
        <h2 className="mt-2 text-center font-display text-3xl leading-none">L’app</h2>
        {src ? <img src={src} alt="QR app" className="mx-auto mt-5 w-full max-w-[260px]" /> : null}
        <p className="mt-4 text-center font-display text-2xl">LBC</p>
        <p className="text-center text-xs text-[#6e655c]">iPhone · Android · iPad</p>
        <p className="mt-1 text-center text-xs text-[#6e655c]">Inquadra e apri</p>
      </article>
    </div>
  );
}
