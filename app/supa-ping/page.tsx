"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "../../lib/supabase/browser";

export default function Page() {
  const [out, setOut] = useState<string>("");

  async function ping() {
    try {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase.auth.getSession();

      setOut(
        JSON.stringify(
          {
            ok: true,
            hasSession: !!data.session,
            error: error ? error.message : null,
          },
          null,
          2
        )
      );
    } catch (e: any) {
      setOut(
        JSON.stringify(
          { ok: false, message: e?.message, name: e?.name },
          null,
          2
        )
      );
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <button onClick={ping}>Ping Supabase</button>
      <pre style={{ marginTop: 16 }}>{out}</pre>
    </div>
  );
}