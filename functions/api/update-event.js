export async function onRequest(context) {
  try {
    const data = await context.request.json();
    
    // 这里添加数据处理逻辑
    // 可以使用 Cloudflare KV 或 D1 存储数据
    
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