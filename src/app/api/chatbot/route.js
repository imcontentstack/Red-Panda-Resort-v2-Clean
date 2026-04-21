export async function POST(req) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const payload = { messages };

    const headers = {
      'Content-Type': 'application/json',
    };

    // Optional auth header if your automation requires it
    if (process.env.AUTOMATIONS_API_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.AUTOMATIONS_API_TOKEN}`;
    }

    const automationUrl = process.env.CONTENTSTACK_AUTOMATIONS_API_URL;

    const response = await fetch(automationUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return Response.json(data, { status: response.ok ? 200 : response.status });
  } catch (error) {
    return Response.json(
      { error: 'Failed to call chatbot automation', details: String(error) },
      { status: 500 }
    );
  }
}

