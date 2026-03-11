import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import IssueOfficeForm from "./IssueOfficeForm";

async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    }
  );
}

type Employee = { id: number; name: string };
type Item = { id: string; sku: string; name: string };

export default async function Page() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div className="p-4">Please log in.</div>;

    const { data: employees, error: empErr } = await supabase
    .from("employees")
    .select("id, name")
    .order("name");

  if (empErr) return <pre className="p-4">{empErr.message}</pre>;

  const { data: items, error: itemErr } = await supabase
    .from("items")
    .select("id, sku, name")
    .eq("active", true)
    .order("sku");

  if (itemErr) return <pre className="p-4">{itemErr.message}</pre>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Issue stock (Office)</h1>

      <IssueOfficeForm
        employees={(employees ?? []) as Employee[]}
        items={(items ?? []) as Item[]}
      />
    </div>
  );
}