export async function onRequest(context) {
    try {
      const formData = await context.request.formData();
      const date = formData.get('date');
      const images = formData.getAll('images');
      const imageUrls = [];
  
      // 上传所有图片到 R2
      for (const image of images) {
        const fileName = `events/${date}/${Date.now()}-${image.name}`;
        await context.env.YOYOPIC.put(fileName, image, {
          httpMetadata: {
            contentType: image.type,
          }
        });
        imageUrls.push(`https://yoyopic.timeflower.live/${fileName}`);
      }
  
      // 保存事件数据到 KV
      await context.env['YOYO-TIMEEVENT'].put(date, JSON.stringify({
        headline: formData.get('headline'),
        description: formData.get('description'),
        based: formData.get('based'),
        imageUrls: imageUrls
      }));
  
      return new Response(JSON.stringify({ 
        success: true,
        imageUrls: imageUrls
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }