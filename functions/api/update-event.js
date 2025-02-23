export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "https://timeflower.pages.dev",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  try {
    const data = await context.request.json();
    console.log('Received data:', data);  // 添加日志

    // 保存事件数据到 KV
    await context.env['YOYO-TIMEEVENT'].put(data.date, JSON.stringify({
      headline: data.headline,
      description: data.description,
      based: data.based,
      imageUrls: data.imageUrls || []
    }));

    return new Response(JSON.stringify({ 
      success: true,
      data: data
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://timeflower.pages.dev'
      }
    });
  } catch (error) {
    console.error('Error:', error);  // 添加错误日志
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://timeflower.pages.dev'
      }
    });
  }
}