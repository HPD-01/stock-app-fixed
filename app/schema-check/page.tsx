"use client";

import { useState } from "react";
import { createClient } from '@/lib/supabase/browser';

export default function Page() {
  const [status, setStatus] = useState("Idle");
  const [out, setOut] = useState<any>(null);

  async function run() {
    setStatus("Running…");

    try {
      const supabase = createClient();

      const itemsRes = await supabase.from("items").select("*").limit(1);
      const jobsRes = await supabase.from("jobs").select("*").limit(1);

      const itemsKeys =
        itemsRes.data && itemsRes.data[0] ? Object.keys(itemsRes.data[0]) : [];
      const jobsKeys =
        jobsRes.data && jobsRes.data[0] ? Object.keys(jobsRes.data[0]) : [];

      setOut({
        items: {
          keys: itemsKeys,
          error: itemsRes.error,
          sample: itemsRes.data?.[0] ?? null,
        },
        jobs: {
          keys: jobsKeys,
          error: jobsRes.error,
          sample: jobsRes.data?.[0] ?? null,
        },
      });

      setStatus("Done");
    } catch (e: any) {
      setStatus(`Threw: ${e?.message ?? String(e)}`);
      setOut({ threw: true, message: e?.message ?? String(e) });
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Schema check</h1>
      <button onClick={run}>Fetch items/jobs</button>
      <p>Status: {status}</p>
      <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
        {out ? JSON.stringify(out, null, 2) : "No output yet"}
      </pre>
    </div>
  );
}