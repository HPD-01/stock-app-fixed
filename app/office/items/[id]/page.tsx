import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type ItemRow = {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  reorder_threshold: number;
};

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: itemId } = await params;

  const supabase = await createClient();

  // Who am I?
  const userRes = await supabase.auth.getUser();
  const userId = userRes.data.user?.id ?? null;

  // Try fetch item
  const itemRes = await supabase
    .from("items")
    .select("id, sku, name, category, reorder_threshold")
    .eq("id", itemId)
    .single<ItemRow>();

  const item = itemRes.data ?? null;

  if (!item) {
    return (
      <div className="space-y-4 rounded-lg border bg-white p-6">
        <h1 className="text-xl font-semibold">Item not found</h1>

        <div className="text-sm space-y-2">
          <div>
            <span className="text-gray-500">URL id:</span>{" "}
            <span className="font-mono">{itemId}</span>
          </div>
          <div>
            <span className="text-gray-500">Logged in user id:</span>{" "}
            <span className="font-mono">{userId ?? "NOT LOGGED IN"}</span>
          </div>
          <div>
            <span className="text-gray-500">Supabase item error:</span>
            <pre className="mt-2 rounded bg-gray-50 p-3 text-xs overflow-x-auto">
{JSON.stringify(itemRes.error, null, 2)}
            </pre>
          </div>
        </div>

        <Link className="text-sm text-blue-600 hover:underline" href="/office">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <h1 className="text-xl font-semibold">
        {item.name} <span className="text-gray-500">({item.sku})</span>
      </h1>

      <p className="text-sm text-gray-600">
        Category: {item.category ?? "—"}
      </p>

      <p className="text-sm text-gray-600">
        Reorder threshold: {item.reorder_threshold}
      </p>

      <Link className="text-sm text-blue-600 hover:underline" href="/office">
        ← Back to dashboard
      </Link>
    </div>
  );
}