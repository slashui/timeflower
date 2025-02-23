export async function onRequest(context) {
  // Handle CORS preflight
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    // Check if request is multipart/form-data
    const contentType = context.request.headers.get('content-type');
    console.log('Content-Type:', contentType);

    const formData = await context.request.formData();
    console.log('Form data received:', {
      date: formData.get('date'),
      headline: formData.get('headline'),
      hasImages: formData.has('images'),
      imageCount: formData.getAll('images').length
    });
    
    // Validate required fields
    const date = formData.get('date');
    if (!date) throw new Error('Date is required');

    // Check R2 binding
    if (!context.env.YOYOPIC) {
      console.error('Available bindings:', Object.keys(context.env));
      throw new Error('R2 bucket binding not found');
    }

    const images = formData.getAll('images');
    const imageUrls = [];

    // Upload images if any
    if (images.length > 0) {
      for (const image of images) {
        console.log('Processing image:', {
          name: image.name,
          type: image.type,
          size: image.size
        });

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
          console.log('Image uploaded successfully:', fileName);
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
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
      console.log('Data saved to KV successfully');
    } catch (kvError) {
      console.error('KV error:', kvError);
      throw new Error(`KV save failed: ${kvError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      imageUrls: imageUrls
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack,
      type: error.constructor.name
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}