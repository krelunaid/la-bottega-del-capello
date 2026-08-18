import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSessionUser } from "@/lib/auth/verify.server";
import { SALON } from "@/lib/salon";
import { assertStaff } from "@/lib/staff-server";
import type { ChatMessage, ChatSender, Conversation } from "@/lib/chat";

function newId(): string {
  return crypto.randomUUID();
}

type ConvRow = {
  id: string;
  user_id: string | null;
  guest_name: string;
  guest_phone: string;
  last_body: string | null;
  last_message_at: string;
  unread_staff: number;
};

type MsgRow = {
  id: string;
  conversation_id: string;
  sender: ChatSender;
  body: string;
  created_at: string;
};

const WELCOME =
  "Buonasera, qui è La Bottega del Capello. Dimmi pure: un dubbio sul taglio, sulla barba o un orario — ti rispondiamo noi.";

async function insertMessage(
  conversationId: string,
  sender: ChatSender,
  body: string,
): Promise<MsgRow> {
  const sql = await getSql();
  const id = newId();
  const rows = await sql<MsgRow>`
    insert into messages (id, conversation_id, sender, body)
    values (${id}, ${conversationId}, ${sender}, ${body})
    returning id, conversation_id, sender, body, created_at::text as created_at
  `;
  await sql`
    update conversations
    set last_body = ${body},
        last_message_at = now(),
        unread_staff = unread_staff + ${sender === "customer" ? 1 : 0}
    where id = ${conversationId}
  `;
  return rows[0];
}

async function loadMessages(conversationId: string): Promise<ChatMessage[]> {
  const sql = await getSql();
  return sql<MsgRow>`
    select id, conversation_id, sender, body, created_at::text as created_at
    from messages
    where conversation_id = ${conversationId}
    order by created_at asc
  `;
}

async function shopReply(history: ChatMessage[], latest: string): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return fallbackReply(latest);
  }
  const prior = history.slice(-8).map((m) => ({
    role: m.sender === "customer" ? ("user" as const) : ("assistant" as const),
    content: m.body,
  }));
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 220,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `Sei la voce de ${SALON.name}, barber shop gentleman a ${SALON.city}.
Telefono ${SALON.phone}. ${SALON.address}. Orari: ${SALON.hoursLabel}. Chiusi domenica e lunedì.
Team: Mario Bassetti (master), Stefano Pierini, Simone Capocchi, Daniele Lera (barba).
Servizi tipici: Shampoo €8 / 30min, Shampoo+Taglio €22 / 60min, Taglio bambino €15, Taglio tosatrice €15, Sfumatura €20, Shampoo e acconciatura €25, Barba €12, Barba nera €15, Barba rasoio €16.
Appuntamenti da 30 o 60 minuti. Prenotazione dall'app.
Rispondi in italiano, tu, tono caldo e preciso, massimo 80 parole. Non inventare sconti o orari diversi. Se chiedono di prenotare, invita a usare Prenota nell'app o WhatsApp ${SALON.phone}.`,
          },
          ...prior,
          { role: "user", content: latest },
        ],
      }),
    });
    if (!res.ok) return fallbackReply(latest);
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim();
    return text || fallbackReply(latest);
  } catch {
    return fallbackReply(latest);
  }
}

function fallbackReply(text: string): string {
  const t = text.toLowerCase();
  if (/(orari|aperto|chius|quando)/.test(t)) {
    return `Siamo aperti ${SALON.hoursLabel}. Domenica e lunedì restiamo chiusi. Ti aspetto in ${SALON.address}.`;
  }
  if (/(prezz|cost|listino|euro)/.test(t)) {
    return "Shampoo + taglio 22€, sfumatura 20€, taglio tosatrice 15€, barba 12€, barba nera 15€. Prenota dall'app e vedi subito i posti liberi.";
  }
  if (/(barba|nero|tinta)/.test(t)) {
    return "Per la barba c'è Daniele, e puoi aggiungerla a qualsiasi taglio: regolazione, rasoio o barba nera. Lo scegli al secondo passo della prenotazione.";
  }
  if (/(prenot|appunt|posto|stefano|mario|simone|daniele)/.test(t)) {
    return "Apri Prenota, scegli il barbiere e l'orario libero. Ti aspettiamo in Bottega.";
  }
  return `Messaggio ricevuto. Se vuoi un posto, prenota dall'app o scrivici al ${SALON.phone}. Altrimenti dimmi pure, ti rispondiamo da qui.`;
}

export const openConversation = createServerFn({ method: "POST" })
  .validator(
    z.object({
      conversationId: z.string().min(8).max(80).optional(),
      name: z.string().trim().min(2).max(80),
      phone: z.string().trim().max(24).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const session = await getSessionUser().catch(() => null);
    const phone = data.phone?.trim() ?? "";

    if (session) {
      const existing = await sql<ConvRow>`
        select id, user_id, guest_name, guest_phone, last_body,
               last_message_at::text as last_message_at, unread_staff
        from conversations where user_id = ${session.id} limit 1
      `;
      if (existing[0]) {
        return {
          conversation: existing[0] as Conversation,
          messages: await loadMessages(existing[0].id),
        };
      }
    }

    if (data.conversationId) {
      const existing = await sql<ConvRow>`
        select id, user_id, guest_name, guest_phone, last_body,
               last_message_at::text as last_message_at, unread_staff
        from conversations where id = ${data.conversationId} limit 1
      `;
      if (existing[0]) {
        if (session && !existing[0].user_id) {
          await sql`
            update conversations set user_id = ${session.id} where id = ${existing[0].id}
          `;
          existing[0].user_id = session.id;
        }
        return {
          conversation: existing[0] as Conversation,
          messages: await loadMessages(existing[0].id),
        };
      }
    }

    const id = newId();
    const rows = await sql<ConvRow>`
      insert into conversations (id, user_id, guest_name, guest_phone, last_body)
      values (${id}, ${session?.id ?? null}, ${data.name}, ${phone}, ${WELCOME})
      returning id, user_id, guest_name, guest_phone, last_body,
                last_message_at::text as last_message_at, unread_staff
    `;
    await insertMessage(id, "shop", WELCOME);
    return { conversation: rows[0] as Conversation, messages: await loadMessages(id) };
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      conversationId: z.string().min(8).max(80),
      body: z.string().trim().min(1).max(800),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const found = await sql<{ id: string }>`
      select id from conversations where id = ${data.conversationId}
    `;
    if (!found[0]) throw new Error("Conversazione non trovata.");
    await insertMessage(data.conversationId, "customer", data.body);
    const history = await loadMessages(data.conversationId);
    const reply = await shopReply(history.slice(0, -1), data.body);
    if (reply) await insertMessage(data.conversationId, "shop", reply);
    return loadMessages(data.conversationId);
  });

export const listChatMessages = createServerFn({ method: "GET" })
  .validator(z.object({ conversationId: z.string().min(8).max(80) }))
  .handler(async ({ data }) => loadMessages(data.conversationId));

export const listStaffConversations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    return sql<ConvRow>`
      select id, user_id, guest_name, guest_phone, last_body,
             last_message_at::text as last_message_at, unread_staff
      from conversations
      order by last_message_at desc
    ` as Promise<Conversation[]>;
  });

export const staffReply = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      conversationId: z.string().min(8).max(80),
      body: z.string().trim().min(1).max(800),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    await sql`
      update conversations set unread_staff = 0 where id = ${data.conversationId}
    `;
    await insertMessage(data.conversationId, "shop", data.body);
    return loadMessages(data.conversationId);
  });

export const markConversationRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ conversationId: z.string().min(8).max(80) }))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const sql = await getSql();
    await sql`update conversations set unread_staff = 0 where id = ${data.conversationId}`;
    return { ok: true };
  });
