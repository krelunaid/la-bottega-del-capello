import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { SALON } from "@/lib/salon";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut, authEnabled } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { user } = useCurrentUserState();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line/70 backdrop-blur-md",
        solid ? "bg-bg/95" : "bg-bg/70",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-6">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <img
            src="/logo.svg"
            alt=""
            className="size-9 rounded-lg object-cover sm:size-10"
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg leading-none tracking-tight text-fg sm:text-xl">
              {SALON.name}
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted sm:block">
              Gentleman Barber
            </span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Link
            to="/chat"
            className="inline-flex size-10 items-center justify-center rounded-full text-muted hover:text-fg sm:h-10 sm:w-auto sm:px-3"
            aria-label="Chat"
          >
            <MessageCircle className="size-4 sm:hidden" />
            <span className="hidden text-sm sm:inline">Chat</span>
          </Link>
          <Link
            to="/appuntamenti"
            className="hidden h-10 items-center rounded-full px-3 text-sm text-muted hover:text-fg md:inline-flex"
          >
            Prenotazioni
          </Link>
          {user ? (
            <div className="flex items-center">
              <Link
                to="/login"
                className="hidden h-10 items-center rounded-full px-3 text-sm text-muted hover:text-fg sm:inline-flex"
              >
                Account
              </Link>
              {authEnabled ? (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="hidden h-10 items-center rounded-full px-3 text-sm text-muted hover:text-fg lg:inline-flex"
                >
                  Esci
                </button>
              ) : null}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center rounded-full px-3 text-sm text-muted hover:text-fg sm:inline-flex"
            >
              Accedi
            </Link>
          )}
          <Link
            to="/prenota"
            className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            Prenota
          </Link>
        </nav>
      </div>
    </header>
  );
}
