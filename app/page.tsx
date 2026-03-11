"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "../lib/supabase/browser";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const supabase = createSupabaseBrowser();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        // Not logged in → go to login
        router.replace("/login");
        return;
      }

      setEmail(data.user.email ?? null);
      setLoading(false);
    };

    run();
  }, [router]);

  if (loading) {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Stock Control App</h1>
      <p>Signed in as: <strong>{email}</strong></p>

      <p>This is the home page.</p>

      <ul>
        <li>Employees will go to <code>/issue</code></li>
        <li>Office staff will go to <code>/office</code></li>
      </ul>
    </div>
  );
}
