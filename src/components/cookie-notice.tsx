import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "lbc-legal-ok";

export function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(window.localStorage.getItem(KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 rounded-2xl bg-[#241f1a] px-4 py-3 shadow-lg ring-1 ring-white/10">
      <p className="text-xs leading-relaxed text-muted">
        Cookie tecnici per l’accesso.{" "}
        <Link to="/legale" className="text-fg underline">
          Privacy e cookie
        </Link>
      </p>
      <button
        type="button"
        className="mt-2 h-10 w-full rounded-xl bg-accent text-sm font-medium text-accent-fg"
        onClick={() => {
          try {
            window.localStorage.setItem(KEY, "1");
          } catch {
            /* ignore */
          }
          setShow(false);
        }}
      >
        Ho capito
      </button>
    </div>
  );
}
