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
    const formData = await context.request.formData();
    const image = formData.get('image');
    
    if (!image) {
      throw new Error('No image file provided');
    }

    if (!image.type.startsWith('image/')) {
      throw new Error(`Invalid file type: ${image.type}`);
    }

    const fileName = `test/${Date.now()}-${image.name}`;
    await context.env.YOYOPIC.put(fileName, image, {
      httpMetadata: {
        contentType: image.type,
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      url: `https://yoyopic.timeflower.live/${fileName}`
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}