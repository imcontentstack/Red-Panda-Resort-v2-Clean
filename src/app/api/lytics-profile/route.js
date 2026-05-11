export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "no id" }, { status: 400 });

  const apiKey = process.env.LYTICS_API_KEY;
  console.log("LYTICS_API_KEY present:", !!apiKey);
  console.log("Fetching Lytics profile for id:", id);

  const url = `https://api.lytics.io/api/user/9616/_uid/${id}?access_token=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });

  console.log("Lytics API response status:", res.status);

  if (!res.ok) {
    const body = await res.text();
    console.log("Lytics API error body:", body);
    return Response.json({ error: "lytics error" }, { status: 500 });
  }

  const data = await res.json();
  const fields = data?.data || {};
  return Response.json(fields);
}