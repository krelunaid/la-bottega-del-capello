export type ChatSender = "customer" | "shop";

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender: ChatSender;
  body: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  user_id: string | null;
  guest_name: string;
  guest_phone: string;
  last_body: string | null;
  last_message_at: string;
  unread_staff: number;
};

export const CHAT_STORAGE_KEY = "bottega.conversationId";

export function formatChatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(d);
}

export function formatChatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(d);
}
