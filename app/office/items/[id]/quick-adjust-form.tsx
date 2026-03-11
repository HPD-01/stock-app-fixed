"use client";

import { useState } from "react";

export default function QuickAdjustForm({
  action,
  currentQty,
}: {
  action: (formData: FormData) => Promise<void>;
  currentQty: number;
}) {
  const [amount, setAmount] = useState<number>(0);

  return (
    <form action={action} className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Quick Adjustment</h2>

      <p className="mt-2 text-sm text-gray-600">
        Current stock: <span className="font-medium">{currentQty}</span>
      </p>

      <div className="mt-4 flex items-center gap-3">
        <input
          name="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-32 rounded border px-3 py-2"
          required
        />

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Adjust
        </button>

        <button
          type="button"
          onClick={() => setAmount(0)}
          className="rounded border px-4 py-2"
        >
          Reset
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Positive adds stock (e.g. 5). Negative removes stock (e.g. -2). Zero is
        rejected.
      </p>
    </form>
  );
}