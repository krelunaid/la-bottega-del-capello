import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { MessageCircle, X } from "lucide-react";
import { ChatThread } from "@/components/chat-thread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CHAT_STORAGE_KEY, type ChatMessage } from "@/lib/chat";
import { openConversation, sendChatMessage } from "@/lib/chat-server";

const HIDDEN = new Set(["/login", "/chat"]);

export function ChatWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.displayName) setName(user.displayName);
  }, [user]);

  if (HIDDEN.has(pathname)) return null;

  async function ensureOpen() {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (convId) return convId;
    const display = (user?.displayName || name || "Ospite").trim();
    if (display.length < 2) return null;
    setBusy(true);
    try {
      const res = await openConversation({
        data: { conversationId: stored ?? undefined, name: display, phone },
      });
      setConvId(res.conversation.id);
      setMessages(res.messages);
      localStorage.setItem(CHAT_STORAGE_KEY, res.conversation.id);
      return res.conversation.id;
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    const id = convId ?? (await ensureOpen());
    if (!id || !draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    setBusy(true);
    try {
      const next = await sendChatMessage({ data: { conversationId: id, body: text } });
      setMessages(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="flex h-[min(540px,72svh)] w-[min(380px,calc(100vw-2rem))] flex-col rounded-2xl border border-line bg-surface p-3 shadow-soft">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="" className="size-8 rounded-lg object-cover" />
              <div>
                <p className="font-display text-lg leading-none">La Bottega</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Chat del salone</p>
              </div>
            </div>
            <Link to="/chat" className="text-xs text-muted hover:text-fg">
              Apri
            </Link>
          </div>
          {convId ? (
            <ChatThread
              messages={messages}
              draft={draft}
              onDraft={setDraft}
              onSend={() => void send()}
              sending={busy}
            />
          ) : (
            <div className="flex flex-1 flex-col justify-end gap-2 p-1">
              <p className="text-sm text-muted">
                Come ti chiami? Poi parliamo di taglio, barba o orari.
              </p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Il tuo nome"
              />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefono"
                inputMode="tel"
              />
              <Button
                type="button"
                disabled={name.trim().length < 2 || busy}
                onClick={() => void ensureOpen()}
              >
                {busy ? "Apro…" : "Inizia"}
              </Button>
            </div>
          )}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-soft"
        aria-label={open ? "Chiudi chat" : "Apri chat"}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </div>
  );
}
