import Link from "next/link";

type LowStockRow = {
  item_id: string;
  sku: string;
  name: string;
  category: string | null;
  quantity_on_hand: number;
  reorder_threshold: number;
};

export default function LowStockPanel({ rows }: { rows: LowStockRow[] }) {
  const count = rows.length;

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Low Stock</h2>

        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            count > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {count}
        </span>
      </div>

      {count === 0 ? (
        <p className="mt-4 text-sm text-gray-600">All items are above threshold.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-4">SKU</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Threshold</th>
                <th className="py-2 pr-4 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.item_id} className="border-b">
                  <td className="py-2 pr-4 font-medium">{row.sku}</td>
                  <td className="py-2 pr-4">{row.name}</td>
                  <td className="py-2 pr-4">{row.quantity_on_hand}</td>
                  <td className="py-2 pr-4">{row.reorder_threshold}</td>
                  <td className="py-2 pr-4 text-right">
                    <Link
                      href={`/office/items/${row.item_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}