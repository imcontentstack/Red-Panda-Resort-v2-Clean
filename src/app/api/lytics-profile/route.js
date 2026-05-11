export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "no id" }, { status: 400 });

  const res = await fetch(
    `https://api.lytics.io/api/user/_uids/${id}?access_token=${process.env.LYTICS_API_KEY}`,
    { cache: "no-store" }
  );

  if (!res.ok) return Response.json({ error: "lytics error" }, { status: 500 });

  const data = await res.json();
  const fields = data?.data || {};
  return Response.json(fields);
}