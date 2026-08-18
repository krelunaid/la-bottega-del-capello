import { createFileRoute, Link } from "@tanstack/react-router";
import { SALON } from "@/lib/salon";

export const Route = createFileRoute("/legale")({ component: Legale });

function Legale() {
  return (
    <article className="px-5 py-6 pb-10 text-sm leading-relaxed text-muted">
      <p className="text-[11px] uppercase tracking-[0.18em] text-subtle">Documenti</p>
      <h1 className="mt-2 font-display text-4xl leading-none text-fg">Privacy e legale</h1>
      <p className="mt-3">
        Testi per {SALON.name}, {SALON.address}, {SALON.city}. Aggiornati al 18 agosto 2026.
      </p>

      <nav className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
        <a href="#privacy" className="rounded-xl bg-elevated px-2 py-3 text-fg">
          Privacy
        </a>
        <a href="#cookie" className="rounded-xl bg-elevated px-2 py-3 text-fg">
          Cookie
        </a>
        <a href="#termini" className="rounded-xl bg-elevated px-2 py-3 text-fg">
          Termini
        </a>
      </nav>

      <section id="privacy" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-3xl text-fg">Privacy</h2>
        <p className="mt-3">
          Il titolare del trattamento è <span className="text-fg">{SALON.name}</span>, {SALON.address}, {SALON.city}.
          Per richieste: <a className="text-fg underline" href={SALON.phoneHref}>{SALON.phone}</a>.
        </p>
        <h3 className="mt-5 font-display text-xl text-fg">Cosa trattiamo</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Nome, cognome, email, telefono</li>
          <li>Account Google o X, se li usi per entrare</li>
          <li>Prenotazioni, servizi, orari, barbiere scelto</li>
          <li>Messaggi della chat con il salone</li>
          <li>Dati tecnici minimi per far funzionare l’app (sessione, dispositivo)</li>
        </ul>
        <h3 className="mt-5 font-display text-xl text-fg">Perché</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Prendere e gestire l’appuntamento (contratto / misure precontrattuali)</li>
          <li>Rispondere in chat e al telefono (legittimo interesse / contratto)</li>
          <li>Tenerti collegato all’app (consenso / contratto)</li>
          <li>Obblighi di legge, se servono</li>
        </ul>
        <h3 className="mt-5 font-display text-xl text-fg">A chi arrivano</h3>
        <p className="mt-2">
          Restano in salone. Google e X ricevono solo i dati dell’accesso, se scegli quel login.
          Non vendiamo i tuoi dati. Non facciamo profilazione pubblicitaria.
        </p>
        <h3 className="mt-5 font-display text-xl text-fg">Quanto li teniamo</h3>
        <p className="mt-2">
          Account e prenotazioni finché usi l’app e per il tempo utile alla gestione del salone,
          poi li cancelliamo o li anonimizziamo, salvo obblighi di legge.
        </p>
        <h3 className="mt-5 font-display text-xl text-fg">I tuoi diritti</h3>
        <p className="mt-2">
          Puoi chiedere accesso, correzione, cancellazione, limitazione, portabilità e opposizione.
          Puoi revocare il consenso. Puoi scrivere al Garante per la protezione dei dati personali.
        </p>
        <p className="mt-2">
          I minori usano l’app con un genitore o chi ne ha la responsabilità.
        </p>
      </section>

      <section id="cookie" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-3xl text-fg">Cookie</h2>
        <p className="mt-3">
          Usiamo solo cookie e memorie <span className="text-fg">tecniche</span>, necessarie all’app:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>sessione di accesso (email, Google, X, salone)</li>
          <li>preferenza «sono già entrato»</li>
          <li>scelta sul banner cookie</li>
        </ul>
        <p className="mt-3">
          Non usiamo cookie di marketing o di tracciamento di terze parti. Senza i cookie tecnici
          non puoi restare collegato. Google e X, se li usi, hanno le loro informative.
        </p>
      </section>

      <section id="termini" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-3xl text-fg">Condizioni</h2>
        <p className="mt-3">
          L’app serve a prenotare e scrivere a {SALON.name}. La prenotazione è una richiesta al salone:
          confermata in app, vale come appuntamento.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Prezzi e durate sono quelli in listino, modificabili dal salone</li>
          <li>Se non puoi venire, avvisa prima: telefono o chat</li>
          <li>Il salone può spostare o rifiutare uno slot per motivi organizzativi</li>
          <li>Il pagamento si fa in salone, salvo diverso accordo</li>
          <li>Non usare l’app per insulti o contenuti illeciti</li>
          <li>Il salone può chiudere un account in caso di abuso</li>
        </ul>
        <p className="mt-3">
          L’app è fornita «così com’è». Per danni da ritardi, assenze o errori di slot, ci si sente
          in salone. Legge italiana. Foro di Pistoia, se applicabile.
        </p>
      </section>

      <p className="mt-10 text-xs text-subtle">
        Testo pensato per un salone di paese. Se vuoi, fallo rileggere a un consulente privacy.
      </p>
      <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-subtle">by kreluna</p>
      <Link to="/" className="mt-4 inline-block text-sm text-fg">
        Torna in Home
      </Link>
    </article>
  );
}
