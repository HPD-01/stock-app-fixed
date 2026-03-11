"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "../../lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // If the user arrived via a valid recovery link, Supabase sets a recovery session.
    // We can optionally check session here.
    (async () => {
      const supabase = createSupabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // Not always fatal, but helpful messaging
        setMsg("Open this page using the newest password reset email link.");
      }
    })();
  }, []);

  async function updatePassword() {
    setMsg("");
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMsg(`Supabase error: ${error.message}`);
        return;
      }
      setMsg("Password updated ✓ You can now sign in.");
      setTimeout(() => router.replace("/login"), 800);
    } catch (e: any) {
      setMsg(`Threw: ${e?.message ?? String(e)}`);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h1>Reset password</h1>
      <label style={{ display: "block", marginTop: 12 }}>
        New password
        <input
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <button style={{ marginTop: 16 }} onClick={updatePassword}>
        Update password
      </button>

      {msg && <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{msg}</pre>}
    </div>
  );
}