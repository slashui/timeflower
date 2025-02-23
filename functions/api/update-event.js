export async function onRequest(context) {
    try {
      const formData = await context.request.formData();
      console.log('Received form data:', {
        date: formData.get('date'),
        headline: formData.get('headline'),
        imageCount: formData.getAll('images').length
      });

      const date = formData.get('date');
      const images = formData.getAll('images');
      const imageUrls = [];
  
      // 上传所有图片到 R2
      for (const image of images) {
        try {
          console.log('Processing image:', image.name, image.type);
          const fileName = `events/${date}/${Date.now()}-${image.name}`;
          await context.env.YOYOPIC.put(fileName, image, {
            httpMetadata: {
              contentType: image.type,
            }
          });
          imageUrls.push(`https://yoyopic.timeflower.live/${fileName}`);
          console.log('Successfully uploaded:', fileName);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error(`Failed to upload image ${image.name}: ${uploadError.message}`);
        }
      }
  
      // 保存事件数据到 KV
      try {
        const eventData = {
          headline: formData.get('headline'),
          description: formData.get('description'),
          based: formData.get('based'),
          imageUrls: imageUrls
        };
        console.log('Saving to KV:', eventData);
        await context.env['YOYO-TIMEEVENT'].put(date, JSON.stringify(eventData));
      } catch (kvError) {
        console.error('KV save error:', kvError);
        throw new Error(`Failed to save to KV: ${kvError.message}`);
      }
  
      return new Response(JSON.stringify({ 
        success: true,
        imageUrls: imageUrls
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Main error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}