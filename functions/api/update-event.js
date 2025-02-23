export async function onRequest(context) {
  try {
    // Check if request is multipart/form-data
    const contentType = context.request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const formData = await context.request.formData();
    
    // Validate required fields
    const date = formData.get('date');
    if (!date) throw new Error('Date is required');

    // Log received data
    console.log('Processing request:', {
      date,
      headline: formData.get('headline'),
      hasImages: formData.has('images')
    });

    // Check R2 binding
    if (!context.env.YOYOPIC) {
      throw new Error('R2 bucket binding not found');
    }

    const images = formData.getAll('images');
    const imageUrls = [];

    // Upload images if any
    if (images.length > 0) {
      for (const image of images) {
        if (!image.type.startsWith('image/')) {
          throw new Error(`Invalid file type: ${image.type}`);
        }

        const fileName = `events/${date}/${Date.now()}-${image.name}`;
        try {
          await context.env.YOYOPIC.put(fileName, image, {
            httpMetadata: {
              contentType: image.type,
            }
          });
          imageUrls.push(`https://yoyopic.timeflower.live/${fileName}`);
        } catch (uploadError) {
          throw new Error(`Failed to upload ${image.name}: ${uploadError.message}`);
        }
      }
    }

    // Save to KV
    const eventData = {
      headline: formData.get('headline'),
      description: formData.get('description'),
      based: formData.get('based'),
      imageUrls: imageUrls
    };

    try {
      await context.env['YOYO-TIMEEVENT'].put(date, JSON.stringify(eventData));
    } catch (kvError) {
      throw new Error(`KV save failed: ${kvError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      imageUrls: imageUrls
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}