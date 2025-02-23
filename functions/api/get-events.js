export async function onRequest(context) {
  try {
    // 获取所有事件的键
    const list = await context.env['YOYO-TIMEEVENT'].list();
    const events = {};
    
    // 获取每个事件的详细数据
    for (const key of list.keys) {
      const value = await context.env['YOYO-TIMEEVENT'].get(key.name);
      events[key.name] = [JSON.parse(value)];
    }
    
    return new Response(JSON.stringify(events), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}