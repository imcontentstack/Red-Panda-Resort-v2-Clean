export async function GET(request, { params }) {
  const { id } = params;

  const res = await fetch(
    `https://api.lytics.io/api/content/recommend/user/_uids/${id}?contentsegment=${process.env.LYTICS_COLLECTION_ID}&limit=3&shuffle=true`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: process.env.LYTICS_API_KEY,
        cache: 'no-store'
      },
    }
  );

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch from Lytics API' }),
      { status: res.status }
    );
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}