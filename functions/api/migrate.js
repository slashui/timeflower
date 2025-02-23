import yaml from 'js-yaml';

export async function onRequest(context) {
  try {
    const response = await fetch('https://raw.githubusercontent.com/slashui/timeflower/main/data/events.yml');
    const yamlText = await response.text();
    
    // Parse YAML
    const events = yaml.load(yamlText);
    
    // Migrate to KV
    for (const [date, eventArray] of Object.entries(events)) {
      const event = eventArray[0];
      await context.env.YOYO_TIMEEVENT.put(date, JSON.stringify(event));
    }
    
    return new Response('Migration completed!', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    return new Response(`Migration failed: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}