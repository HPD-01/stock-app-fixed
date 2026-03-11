import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Item = {
  id: string;
  sku: string | null;
  name: string | null;
  category: string | null;
  reorder_threshold: number | null;
};

type Movement = {
  item_id: string;
  delta: number | null;
};

function statusOf(qty: number, threshold: number) {
  if (qty <= threshold) {
    return { label: "Low", bg: "#FEF3C7", fg: "#92400E" };
  }
  return { label: "OK", bg: "#DCFCE7", fg: "#166534" };
}

export default async function OfficePage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  // Get items
  const { data: items } = await supabase
    .from("items")
    .select("id, sku, name, category, reorder_threshold")
    .order("sku");

  // Get stock movements
  const { data: movements } = await supabase
    .from("stock_movements")
    .select("item_id, delta");

  const stockMap = new Map<string, number>();

  (movements ?? []).forEach((m: Movement) => {
    const current = stockMap.get(m.item_id) ?? 0;
    stockMap.set(m.item_id, current + (m.delta ?? 0));
  });

  const rows =
    (items ?? []).map((item: Item) => {
      const qty = stockMap.get(item.id) ?? 0;
      const threshold = item.reorder_threshold ?? 0;
      const status = statusOf(qty, threshold);

      return { item, qty, threshold, status };
    }) ?? [];

  const lowStock = rows.filter((r) => r.qty <= r.threshold);

  return (
    <div style={{ padding: 16 }}>
      <h1>Office Dashboard</h1>

      {/* LOW STOCK PANEL */}

      <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 20 }}>
        <h2>
          Low Stock{" "}
          <span
            style={{
              background: lowStock.length ? "#EF4444" : "#E5E7EB",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 12,
              marginLeft: 8,
            }}
          >
            {lowStock.length}
          </span>
        </h2>

        {lowStock.length === 0 ? (
          <p>All items are above threshold.</p>
        ) : (
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th align="left">SKU</th>
                <th align="left">Name</th>
                <th align="left">Current quantity</th>
                <th align="left">Reorder threshold</th>
                <th align="left">Status</th>
              </tr>
            </thead>

            <tbody>
              {lowStock.map((r) => (
                <tr key={r.item.id}>
                  <td>{r.item.sku}</td>
                  <td>{r.item.name}</td>
                  <td>{r.qty}</td>
                  <td>{r.threshold}</td>
                  <td>
                    <span
                      style={{
                        background: r.status.bg,
                        color: r.status.fg,
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                      }}
                    >
                      {r.status.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FULL STOCK TABLE */}

      <div style={{ border: "1px solid #ddd", padding: 12 }}>
        <h2>Stock</h2>

        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th align="left">SKU</th>
              <th align="left">Name</th>
              <th align="left">Category</th>
              <th align="left">Quantity</th>
              <th align="left">Threshold</th>
              <th align="left">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.item.id}>
                <td>{r.item.sku}</td>
                <td>{r.item.name}</td>
                <td>{r.item.category}</td>
                <td>{r.qty}</td>
                <td>{r.threshold}</td>
                <td>
                  <span
                    style={{
                      background: r.status.bg,
                      color: r.status.fg,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                    }}
                  >
                    {r.status.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}