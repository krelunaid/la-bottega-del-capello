type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

export function subscribeInstall(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function canNativeInstall() {
  return Boolean(deferred);
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios = "standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

export function deviceKind(): "ios" | "ipad" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const iPad = /iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iPad) return "ipad";
  if (/iPhone|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";
  const ev = deferred;
  deferred = null;
  notify();
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  return outcome === "accepted" ? "accepted" : "dismissed";
}

export async function openIosAddHome(): Promise<boolean> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  try {
    await navigator.share({
      title: "La Bottega del Capello",
      text: "Aggiungi a Home",
      url: `${window.location.origin}/`,
    });
    return true;
  } catch {
    return false;
  }
}

function listenInstall() {
  if (typeof window === "undefined") return;
  if ((window as Window & { __lbcInstall?: boolean }).__lbcInstall) return;
  (window as Window & { __lbcInstall?: boolean }).__lbcInstall = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

export function registerPwa() {
  if (typeof window === "undefined") return;
  const boot = () => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
    listenInstall();
  };
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (idle) idle(boot);
  else window.setTimeout(boot, 1);
}

if (typeof window !== "undefined") listenInstall();

export function appUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/apri`;
}

export function homeUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/`;
}

export function qrImageUrl(data: string, size = 480): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=14&color=17-14-12&bgcolor=243-238-230&data=${encodeURIComponent(data)}`;
}
