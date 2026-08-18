import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { auth } from "@/lib/auth/server";

export type StaffProfile = {
  userId: string;
  name: string;
  stylistId: string | null;
};

const STAFF_ACCOUNTS: Record<
  string,
  { password: string; name: string; stylistId: string | null }
> = {
  "negozio@bottega.it": { password: "Bottega2025", name: "Sala", stylistId: null },
};

export function staffPreset(email: string) {
  return STAFF_ACCOUNTS[email.trim().toLowerCase()] ?? null;
}

async function upsertStaffRow(userId: string, name: string, stylistId: string | null) {
  const sql = await getSql();
  await sql`
    create table if not exists staff_members (
      user_id text primary key,
      name text not null,
      stylist_id text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    insert into staff_members (user_id, name, stylist_id)
    values (${userId}, ${name}, ${stylistId})
    on conflict (user_id) do update set name = excluded.name, stylist_id = excluded.stylist_id
  `;
}

export async function findStaff(userId: string): Promise<StaffProfile | null> {
  const sql = await getSql();
  const rows = await sql<{ user_id: string; name: string; stylist_id: string | null }>`
    select user_id, name, stylist_id from staff_members where user_id = ${userId}
  `;
  const row = rows[0];
  if (row) return { userId: row.user_id, name: row.name, stylistId: row.stylist_id };

  const users = await sql<{ email: string }>`
    select email from "user" where id = ${userId}
  `;
  const preset = users[0]?.email ? staffPreset(users[0].email) : null;
  if (!preset) return null;
  await upsertStaffRow(userId, preset.name, preset.stylistId);
  return { userId, name: preset.name, stylistId: preset.stylistId };
}

export async function assertStaff(userId: string): Promise<StaffProfile> {
  const staff = await findStaff(userId);
  if (!staff) throw new Error("Accesso non consentito.");
  return staff;
}

export const getStaffProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => findStaff(context.userId));

export const provisionStaffLogin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().trim().email(),
      password: z.string().min(4).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const preset = staffPreset(email);
    if (!preset) return { ok: false as const, token: null as string | null };
    if (preset.password !== data.password) {
      throw new Error("Email o password non corrette.");
    }

    const sql = await getSql();
    const existing = await sql<{ id: string }>`
      select id from "user" where lower(email) = ${email}
    `;
    if (existing[0]) {
      const id = existing[0].id;
      await sql`delete from "session" where "userId" = ${id}`;
      await sql`delete from "account" where "userId" = ${id}`;
      await sql`delete from staff_members where user_id = ${id}`;
      await sql`delete from "user" where id = ${id}`;
    }

    const headers = getRequest()?.headers ?? new Headers();
    const created = await auth.api.signUpEmail({
      body: { email, password: data.password, name: preset.name },
      headers,
    });
    const userId = created.user.id;
    await upsertStaffRow(userId, preset.name, preset.stylistId);

    const signed = await auth.api.signInEmail({
      body: { email, password: data.password },
      headers,
    });
    const token = signed.token ?? null;
    return { ok: true as const, token };
  });
