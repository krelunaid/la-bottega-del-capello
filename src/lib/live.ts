export const AGENDA_EVENT = "bottega-agenda";

export function notifyAgenda() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AGENDA_EVENT));
}
