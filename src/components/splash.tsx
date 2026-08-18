import { useEffect, useState } from "react";

const KEY = "lbc-splash-v6";

function seenOrAuthed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (window.sessionStorage.getItem(KEY) === "1") return true;
    if (window.sessionStorage.getItem("grok-auth.bearer-token")) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function useSplash() {
  const [on, setOn] = useState(() => !seenOrAuthed());

  function close() {
    try {
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOn(false);
  }

  useEffect(() => {
    if (!on) return;
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        close();
        return;
      }
    } catch {
      /* play */
    }
    const t = window.setTimeout(close, 2700);
    return () => window.clearTimeout(t);
  }, [on]);

  return { on, close };
}

export function Splash({ show, onSkip }: { show: boolean; onSkip: () => void }) {
  if (!show) return null;
  return (
    <button type="button" className="splash-screen" onClick={onSkip} aria-label="Entra">
      <span className="splash-letterbox splash-letterbox-top" />
      <span className="splash-letterbox splash-letterbox-bot" />
      <span className="splash-wipe" />
      <span className="splash-flare" />
      <span className="splash-grain" />
      <span className="splash-mark">
        <img src="/logo-lbc.png" alt="" className="splash-logo" />
        <span className="splash-name">La Bottega del Capello</span>
      </span>
    </button>
  );
}
