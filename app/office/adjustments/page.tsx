import AdjustmentsForm from "./AdjustmentsForm";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type SP = { item_id?: string };

async function createSupabaseServerClient() {
  const cookieStore = cookies() as any;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll?.() ?? [];
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set?.(name, value, options);
            });
          } catch {
            // ignore in read-only contexts
          }
        },
      },
    }
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ item_id?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const initialItemId = sp?.item_id ?? "";

  const supabase = await createSupabaseServerClient();

  const { data: items, error } = await supabase
    .from("items")
    .select("id, sku, name")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold">Adjustments</h1>
        <pre className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Adjustments</h1>
      <AdjustmentsForm
        key={initialItemId || "none"}
        initialItemId={initialItemId}
        items={items ?? []}
      />
    </div>
  );
}