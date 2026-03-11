"use client";

import { useMemo, useState, useTransition } from "react";
import { createIssueOffice } from "./actions";

type Employee = { id: number; name: string };
type Item = { id: string; sku: string; name: string };
type Line = { item_id: string; qty: number };

export default function IssueOfficeForm(props: { employees: Employee[]; items: Item[] }) {
  const { employees, items } = props;

  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const [employeeName, setEmployeeName] = useState("");
  const [jobNumber, setJobNumber] = useState(""); // ✅ typed in
  const [notes, setNotes] = useState("");

  const emptyLine: Line = useMemo(() => ({ item_id: "", qty: 1 }), []);
  const [lines, setLines] = useState<Line[]>([emptyLine]);

  function updateLine(idx: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { item_id: "", qty: 1 }]);
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const cleaned = lines
      .map((l) => ({ item_id: l.item_id, qty: Number(l.qty) }))
      .filter((l) => l.item_id && l.qty > 0);

    if (!employeeName) return setMsg("Select an employee.");
    if (!jobNumber.trim()) return setMsg("Job number is required.");
    if (cleaned.length === 0) return setMsg("Add at least 1 item line.");

    const fd = new FormData();
    fd.set("employee_name", employeeName);
    fd.set("job_number", jobNumber.trim()); // ✅ typed in
    fd.set("notes", notes.trim());
    fd.set("lines_json", JSON.stringify(cleaned));

    startTransition(async () => {
      const res = await createIssueOffice(fd);
      if (!res.ok) return setMsg(res.message ?? "Unexpected error");

      setMsg(`Created issue ${res.issue_id}`);
      setEmployeeName("");
      setJobNumber("");
      setNotes("");
      setLines([{ item_id: "", qty: 1 }]);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 max-w-3xl space-y-6">
      {msg ? <div className="rounded border p-3 text-sm">{msg}</div> : null}

      <div className="space-y-1">
        <label className="block text-sm font-medium">Employee</label>
        <select
          className="w-full rounded border p-2"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          required
        >
          <option value="" disabled>
            Select employee…
          </option>
          {employees.map((e) => (
            <option key={e.id} value={e.name}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Job number</label>
        <input
          className="w-full rounded border p-2"
          value={jobNumber}
          onChange={(e) => setJobNumber(e.target.value)}
          required
          placeholder="e.g. 24-031"
        />
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Items</h2>
          <button type="button" className="rounded border px-3 py-1 text-sm" onClick={addLine}>
            + Add line
          </button>
        </div>

        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="flex gap-2">
              <select
                className="flex-1 rounded border p-2"
                value={line.item_id}
                onChange={(e) => updateLine(idx, { item_id: e.target.value })}
              >
                <option value="">Select item…</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.sku} — {it.name}
                  </option>
                ))}
              </select>

              <input
                className="w-28 rounded border p-2"
                type="number"
                min={1}
                value={line.qty}
                onChange={(e) => updateLine(idx, { qty: Number(e.target.value) })}
              />

              <button
                type="button"
                className="rounded border px-3"
                onClick={() => removeLine(idx)}
                disabled={lines.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={pending}>
        {pending ? "Creating…" : "Create issue"}
      </button>
    </form>
  );
}