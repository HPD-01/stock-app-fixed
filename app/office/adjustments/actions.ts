"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function createSupabaseServerActionClient() {
  const cookieStore = (await cookies()) as any;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll?.() ?? [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set?.(name, value, options);
          });
        },
      },
    }
  );
}

export type CreateAdjustmentState =
  | { ok: true }
  | { ok: false; message: string };

export async function createAdjustment(
  formData: FormData
): Promise<CreateAdjustmentState> {
  const item_id = String(formData.get("item_id") ?? "").trim();
  const deltaRaw = String(formData.get("delta") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!item_id) return { ok: false, message: "Item is required." };
  if (!deltaRaw) return { ok: false, message: "Delta is required." };

  const delta = Number(deltaRaw);
  if (!Number.isFinite(delta) || delta === 0) {
    return { ok: false, message: "Delta must be a number and not 0." };
  }

  if (!reason) return { ok: false, message: "Reason is required." };

  const supabase = await createSupabaseServerActionClient();

  const { error } = await supabase.from("stock_adjustments").insert({
    item_id,
    delta,
    reason,
    notes: notes || null,
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}