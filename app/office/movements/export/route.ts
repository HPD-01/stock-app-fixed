import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: movements } = await supabase
    .from("stock_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  const rows = movements ?? [];

  // Resolve issues
  const issueIds = [
    ...new Set(
      rows
        .filter((m) => m.source === "issue" && m.source_id)
        .map((m) => m.source_id)
    ),
  ];

  const { data: issues } = issueIds.length
    ? await supabase
        .from("issues")
        .select("id, job_number, employee_name")
        .in("id", issueIds as any)
    : { data: [] };

  const issueMap = new Map();
  issues?.forEach((i: any) => issueMap.set(i.id, i));

  function resolveIssue(m: any) {
    if (m.source !== "issue") return null;
    if (!m.source_id) return null;
    return issueMap.get(m.source_id) ?? null;
  }

  // Resolve items
  const itemIds = [
    ...new Set(
      rows
        .map((m) => m.item_id)
        .filter(Boolean)
    ),
  ];

  const { data: items } = itemIds.length
    ? await supabase
        .from("items")
        .select("id, name")
        .in("id", itemIds as any)
    : { data: [] };

  const itemMap = new Map();
  items?.forEach((i: any) => itemMap.set(i.id, i.name));

  // Build CSV
  const csvRows = [
    [
      "When",
      "Item",
      "Job Number",
      "Employee",
      "Delta",
      "Source",
    ],
  ];

  rows.forEach((m: any) => {
    const issue = resolveIssue(m);

    csvRows.push([
      new Date(m.created_at).toLocaleString(),
      itemMap.get(m.item_id) ?? "",
      issue?.job_number ?? "",
      issue?.employee_name ?? "",
      String(m.delta),
      m.source ?? "",
    ]);
  });

  function escapeCSV(value: any) {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

const csv = csvRows
  .map((row) => row.map((v) => escapeCSV(v)).join(","))
  .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=stock_movements.csv",
    },
  });
}