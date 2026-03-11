export default function Page() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return (
    <pre style={{ padding: 16 }}>
      URL set? {String(!!url)}
      {"\n"}
      ANON set? {String(!!anon)}
      {"\n\n"}
      URL length: {url.length}
      {"\n"}
      ANON length: {anon.length}
    </pre>
  );
}