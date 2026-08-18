import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { ChatThread } from "@/components/chat-thread";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CHAT_STORAGE_KEY, type ChatMessage } from "@/lib/chat";
import { listChatMessages, openConversation, sendChatMessage } from "@/lib/chat-server";

export const Route = createFileRoute("/chat")({ component: ChatPage });

function ChatPage() {
  const { user, isPending } = useCurrentUserState();
  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [ready, setReady] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (user?.displayName && !name) setName(user.displayName);
  }, [user, name]);

  useEffect(() => {
    if (isPending) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem(CHAT_STORAGE_KEY) : null;
    if (!stored && !user) return;
    const display = user?.displayName || name || "Ospite";
    setOpening(true);
    openConversation({
      data: { conversationId: stored ?? undefined, name: display, phone },
    })
      .then((res) => {
        setConvId(res.conversation.id);
        setMessages(res.messages);
        setReady(true);
        localStorage.setItem(CHAT_STORAGE_KEY, res.conversation.id);
      })
      .catch(() => setReady(false))
      .finally(() => setOpening(false));
  }, [user, isPending]);

  useEffect(() => {
    if (!convId || !ready) return;
    const tick = window.setInterval(() => {
      listChatMessages({ data: { conversationId: convId } })
        .then(setMessages)
        .catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(tick);
  }, [convId, ready]);

  async function startGuest() {
    if (name.trim().length < 2) return;
    setOpening(true);
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY) ?? undefined;
      const res = await openConversation({
        data: { conversationId: stored, name: name.trim(), phone: phone.trim() },
      });
      setConvId(res.conversation.id);
      setMessages(res.messages);
      setReady(true);
      localStorage.setItem(CHAT_STORAGE_KEY, res.conversation.id);
    } finally {
      setOpening(false);
    }
  }

  async function send() {
    if (!convId || !draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      conversation_id: convId,
      sender: "customer",
      body: text,
      created_at: new Date().toISOString(),
    };
    setMessages((curr) => [...curr, optimistic]);
    setSending(true);
    try {
      const next = await sendChatMessage({ data: { conversationId: convId, body: text } });
      setMessages(next);
    } finally {
      setSending(false);
    }
  }

  if (ready) {
    return (
      <div className="flex h-full min-h-0 flex-col px-3 pb-3 pt-2">
        <ChatThread
          messages={messages}
          draft={draft}
          onDraft={setDraft}
          onSend={() => void send()}
          sending={sending}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center px-6">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-elevated text-accent">
        <MessageCircle className="size-6" />
      </div>
      <h1 className="mt-5 text-center font-display text-3xl">Scrivi in bottega</h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-sm text-muted">
        Un filo diretto con il salone. Orari, consigli, un dubbio sulla barba.
      </p>
      {isPending ? (
        <p className="mt-6 text-center text-sm text-subtle">Un attimo…</p>
      ) : (
        <form
          className="mx-auto mt-6 grid w-full max-w-sm gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void startGuest();
          }}
        >
          <label className="grid gap-1.5">
            <Label htmlFor="chat-name">Come ti chiami</Label>
            <Input id="chat-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="grid gap-1.5">
            <Label htmlFor="chat-phone">Telefono</Label>
            <Input
              id="chat-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="333…"
            />
          </label>
          <Button type="submit" disabled={opening || name.trim().length < 2}>
            {opening ? "Apro la chat…" : "Inizia a scrivere"}
          </Button>
          {!user ? (
            <Link to="/login" search={{ next: "/chat" }} className="text-center text-sm text-muted">
              Oppure accedi con Google
            </Link>
          ) : null}
        </form>
      )}
    </div>
  );
}
