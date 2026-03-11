import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";

export default async function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USER:", user); // 👈 add this

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}