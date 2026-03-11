import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Movement = {
  id: string;
  item_id: string;
  delta: number;
  source: string;
  source_id: string | null;
  created_by: string | null;
  created_at: string;
  reason: string | null;
  note: string | null;
};

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; employee?: string }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const selectedJob = params?.job ?? "";
  const selectedEmployee = params?.employee ?? "";

  const { data: movements } = await supabase
    .from("stock_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows: Movement[] = movements ?? [];
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

  const issueIds = [
    ...new Set(
      rows
        .filter((m) => m.source === "issue" && m.source_id)
        .map((m) => m.source_id as string)
    ),
  ];

  const { data: issues } = issueIds.length
    ? await supabase
        .from("issues")
        .select("id, job_number, employee_name, created_by, notes")
        .in("id", issueIds as any)
    : { data: [] };

  const issueMap = new Map();
  issues?.forEach((i: any) => issueMap.set(i.id, i));

  function resolveIssue(m: Movement) {
    if (m.source !== "issue") return null;
    if (!m.source_id) return null;
    return issueMap.get(String(m.source_id)) ?? null;
  }

  const creatorIds = [
    ...new Set(
      rows
        .map((m) => {
          if (m.source === "issue") {
            return resolveIssue(m)?.created_by ?? null;
          }
          if (m.source === "adjustment") {
            return m.created_by ?? null;
          }
          return null;
        })
        .filter(Boolean)
    ),
  ];

  const { data: creators } = creatorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", creatorIds)
    : { data: [] };

  const creatorMap = new Map();
  creators?.forEach((p: any) => {
    if (p.full_name) {
      creatorMap.set(p.id, p.full_name.split(" ")[0]);
    }
  });

  function issuedBy(m: Movement) {
    if (m.source === "issue") {
      const issue = resolveIssue(m);
      if (!issue?.created_by) return "—";
      return creatorMap.get(issue.created_by) ?? "—";
    }

    if (m.source === "adjustment") {
      if (!m.created_by) return "—";
      return creatorMap.get(m.created_by) ?? "—";
    }

    return "—";
  }

  const jobOptions = Array.from(
    new Set(issues?.map((i: any) => i.job_number).filter(Boolean))
  );

  const employeeOptions = Array.from(
    new Set(issues?.map((i: any) => i.employee_name).filter(Boolean))
  );

  let filtered = rows;

  if (selectedJob) {
    filtered = filtered.filter(
      (m) => resolveIssue(m)?.job_number === selectedJob
    );
  }

  if (selectedEmployee) {
    filtered = filtered.filter(
      (m) => resolveIssue(m)?.employee_name === selectedEmployee
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Stock Movement History</h1>

      <form method="get" style={{ marginBottom: 16 }}>
        <label>Job: </label>
        <select name="job" defaultValue={selectedJob}>
          <option value="">All</option>
          {jobOptions.map((job) => (
            <option key={job as string} value={job as string}>
              {job as string}
            </option>
          ))}
        </select>

        <label style={{ marginLeft: 16 }}>Employee: </label>
        <select name="employee" defaultValue={selectedEmployee}>
          <option value="">All</option>
          {employeeOptions.map((emp) => (
            <option key={emp as string} value={emp as string}>
              {emp as string}
            </option>
          ))}
        </select>

        <button type="submit" style={{ marginLeft: 12 }}>
          Apply
        </button>

        {(selectedJob || selectedEmployee) && (
          <a href="/office/movements" style={{ marginLeft: 12 }}>
            Clear
          </a>
        )}
      </form>

      <div style={{ marginBottom: 12 }}>
        <a
          href="/office/movements/export"
          style={{
            padding: "6px 12px",
            background: "#2563EB",
            color: "white",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          Export CSV
        </a>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
           <th align="left">When</th>
<th align="left">Item</th>
<th align="left">Job #</th>
<th align="left">Issued To</th>
<th align="left">Issued By</th>
<th align="left">Amount</th>
<th align="left">Source</th>
<th align="left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => {
            const issue = resolveIssue(m);

            return (
              <tr key={m.id}>
                <td>{new Date(m.created_at).toLocaleString()}</td>
                <td>{itemMap.get(m.item_id) ?? "—"}</td>
<td>{issue?.job_number ?? "—"}</td>
<td>{issue?.employee_name ?? "—"}</td>
<td>{issuedBy(m)}</td>
<td>{m.delta}</td>
<td>{m.source}</td>
<td>{m.source === "issue" ? issue?.notes ?? "—" : m.note ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}