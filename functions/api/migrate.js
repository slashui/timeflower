export async function onRequest(context) {
  try {
    const response = await fetch('https://raw.githubusercontent.com/slashui/timeflower/main/data/events.yml');
    const yamlText = await response.text();
    
    // 解析 YAML
    const events = jsyaml.load(yamlText);
    
    // 迁移到 KV
    for (const [date, eventArray] of Object.entries(events)) {
      const event = eventArray[0];
      await context.env.YOYO-TIMEEVENT.put(date, JSON.stringify(event));
    }
    
    return new Response('迁移完成！', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    return new Response(`迁移失败: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}