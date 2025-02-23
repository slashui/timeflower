export async function onRequest(context) {
  try {
    const data = await context.request.json();
    
    // 存储到 KV
    await context.env.EVENTS_KV.put(data.date, JSON.stringify({
      headline: data.headline,
      description: data.description,
      based: data.based
    }));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}