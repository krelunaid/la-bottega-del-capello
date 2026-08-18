import { useEffect, useRef, type FormEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatChatTime, type ChatMessage } from "@/lib/chat";

type Props = {
  messages: ChatMessage[];
  draft: string;
  onDraft: (v: string) => void;
  onSend: () => void;
  sending?: boolean;
  placeholder?: string;
  emptyHint?: string;
  perspective?: "customer" | "shop";
};

export function ChatThread({
  messages,
  draft,
  onDraft,
  onSend,
  sending,
  placeholder = "Scrivi alla bottega…",
  emptyHint,
  perspective = "customer",
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    onSend();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-2">
        {messages.length === 0 && emptyHint ? (
          <p className="px-3 py-8 text-center text-sm text-subtle">{emptyHint}</p>
        ) : null}
        {messages.map((m) => {
          const mine = perspective === "shop" ? m.sender === "shop" : m.sender === "customer";
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  mine
                    ? "rounded-br-md bg-accent text-accent-fg"
                    : "rounded-bl-md bg-elevated text-fg",
                )}
              >
                {!mine ? (
                  <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-accent">
                    Bottega
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={cn("mt-1 text-[10px] tabular-nums", mine ? "opacity-70" : "text-subtle")}>
                  {formatChatTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={submit}
        className="mt-3 flex items-end gap-2 rounded-xl border border-line bg-elevated p-2"
      >
        <textarea
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (draft.trim() && !sending) onSend();
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-fg outline-none placeholder:text-subtle"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-accent-fg disabled:opacity-40"
          aria-label="Invia"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
