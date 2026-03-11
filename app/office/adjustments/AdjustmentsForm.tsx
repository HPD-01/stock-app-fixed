"use client";

import { useEffect, useState, useTransition } from "react";
import { createAdjustment } from "./actions";

type Item = { id: string; sku: string; name: string };

export default function AdjustmentsForm(props: {
  initialItemId?: string;
  items: Item[];
}) {
  const { initialItemId, items } = props;

  const [itemId, setItemId] = useState(initialItemId ?? "");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setItemId(initialItemId ?? "");
  }, [initialItemId]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const fd = new FormData();
    fd.set("item_id", itemId);
    fd.set("delta", delta);
    fd.set("reason", reason);
    fd.set("notes", notes);

    startTransition(async () => {
      const res = await createAdjustment(fd);
      if (res.ok) {
        setMsg("Saved.");
        setDelta("");
        setReason("");
        setNotes("");
      } else {
        setMsg(res.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 max-w-xl space-y-4">
      {msg ? (
        <div className="rounded border bg-white p-3 text-sm">{msg}</div>
      ) : null}

      <div className="space-y-1">
        <label className="block text-sm font-medium">Item</label>
        <select
          className="w-full rounded border p-2"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          required
        >
          <option value="" disabled>
            Select an item…
          </option>
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {it.name} ({it.sku})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Delta</label>
        <input
          className="w-full rounded border p-2"
          type="number"
          step="1"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
  <label className="block text-sm font-medium">Reason</label>

  <select
    className="w-full rounded border p-2"
    value={reason}
    onChange={(e) => setReason(e.target.value)}
    required
  >
    <option value="" disabled>
      Select a reason…
    </option>

    <option value="initial_stock">Initial Stock</option>
    <option value="stock_correction">Stock Correction</option>
    <option value="damaged">Damaged</option>
    <option value="lost">Lost</option>
    <option value="supplier_adjustment">Supplier Adjustment</option>
    <option value="admin_adjustment">Admin Adjustment</option>
    <option value="other">Other</option>
  </select>
</div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          className="w-full rounded border p-2"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={pending}
      >
        {pending ? "Saving…" : "Save adjustment"}
      </button>
    </form>
  );
}