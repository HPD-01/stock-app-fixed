"use server";

import { createClient } from "@/lib/supabase/server";

export async function createIssueOffice(formData: FormData) {
  const supabase = await createClient();

  const employeeName = String(formData.get("employee_name") || "");
  const jobNumber = String(formData.get("job_number") || "");
  const notes = String(formData.get("notes") || "");
  const lines = JSON.parse(String(formData.get("lines_json") || "[]"));

  if (!employeeName || !jobNumber || !Array.isArray(lines) || lines.length === 0) {
    return { ok: false, message: "Invalid form data." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated." };
  }

  // Create issue
  const { data: issue, error: issueErr } = await supabase
    .from("issues")
    .insert({
      job_number: jobNumber,
      employee_name: employeeName,
      created_by: user.id,
      notes,
    })
    .select()
    .single();

  if (issueErr) {
    return { ok: false, message: issueErr.message };
  }

  // Insert issue lines
  const issueLines = lines.map((l: any) => ({
    issue_id: issue.id,
    item_id: l.item_id,
    quantity: l.qty,
  }));

  const { error: linesErr } = await supabase
    .from("issue_lines")
    .insert(issueLines);

  if (linesErr) {
    return { ok: false, message: linesErr.message };
  }

  return { ok: true, issue_id: issue.id };
}