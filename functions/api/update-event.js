export async function onRequest(context) {
  const data = await context.request.json();
  
  // 使用 Cloudflare KV 或 D1 存储数据
  // 这里需要在 Cloudflare Dashboard 中设置相应的数据存储
  await context.env.MY_KV.put(`event_${data.date}`, JSON.stringify(data));
  
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}