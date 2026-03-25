const LEONARDO_API_BASE = 'https://cloud.leonardo.ai/api/rest/v1';
// Leonardo Phoenix 0.9 — versatile, high-quality model
const LEONARDO_MODEL_ID = '6b645e3a-d64f-4341-a6d8-7a3690fbf042';

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_LEONARDO_API_KEY;
  if (!key) {
    throw new Error(
      'Missing EXPO_PUBLIC_LEONARDO_API_KEY. Get one from https://app.leonardo.ai/api-access'
    );
  }
  return key;
}

/**
 * Style prompt modifiers for each clipart style.
 */
const stylePrompts: Record<string, string> = {
  'Cartoon':
    'cartoon style, bold outlines, vibrant colors, playful, clean vector art, 3D dimensional',
  'Flat Illustration':
    'flat illustration, minimal shadows, clean geometric shapes, modern vector style, editorial minimal',
  'Anime':
    'anime style, cel-shaded, vibrant, detailed line art, Japanese animation style',
  'Pixel Art':
    'pixel art style, 16-bit, retro game aesthetic, pixelated, nostalgic',
  'Sketch / Outline':
    'pencil sketch, hand-drawn outline, black and white line art, minimal shading',
};

/**
 * Upload a base64 image to Leonardo as an init image.
 * Returns the init image ID for use in generation.
 */
async function uploadInitImage(
  imageBase64: string,
  apiKey: string
): Promise<string> {
  // Step 1: Request presigned upload URL
  const initRes = await fetch(`${LEONARDO_API_BASE}/init-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      extension: 'jpg',
    }),
  });

  if (!initRes.ok) {
    throw new Error(
      `Leonardo init-image error (${initRes.status}): ${await initRes.text()}`
    );
  }

  const initData = await initRes.json();
  const fields = initData.uploadInitImage?.fields;
  const uploadUrl = initData.uploadInitImage?.url;
  const imageId = initData.uploadInitImage?.id;

  if (!uploadUrl || !imageId || !fields) {
    throw new Error('Leonardo returned incomplete init-image data');
  }

  // Step 2: Upload the actual image to the presigned S3 URL
  // In React Native, we can't use Blob from ArrayBuffer.
  // Instead, write the base64 to a temp file and upload via URI.
  const FileSystem = require('expo-file-system/legacy');

  // Strip the data URI prefix if present (e.g. "data:image/jpeg;base64,")
  const rawBase64 = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  // Write base64 to a temp file
  const tempUri = `${FileSystem.cacheDirectory}leonardo_init_${Date.now()}.jpg`;
  await FileSystem.writeAsStringAsync(tempUri, rawBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Build multipart form with the presigned fields + file
  const formData = new FormData();
  const parsedFields =
    typeof fields === 'string' ? JSON.parse(fields) : fields;
  for (const [key, value] of Object.entries(parsedFields)) {
    formData.append(key, value as string);
  }
  // React Native FormData accepts { uri, name, type } for file uploads
  formData.append('file', {
    uri: tempUri,
    name: 'image.jpg',
    type: 'image/jpeg',
  } as any);

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok && uploadRes.status !== 204) {
    throw new Error(
      `S3 upload error (${uploadRes.status}): ${await uploadRes.text()}`
    );
  }

  return imageId;
}

/**
 * Poll Leonardo for generation results until complete.
 */
async function pollGeneration(
  generationId: string,
  apiKey: string
): Promise<any> {
  const maxAttempts = 60;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${LEONARDO_API_BASE}/generations/${generationId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      throw new Error(
        `Leonardo poll error (${res.status}): ${await res.text()}`
      );
    }

    const data = await res.json();
    const generation = data.generations_by_pk;

    if (!generation) {
      throw new Error('Leonardo returned no generation data');
    }

    if (generation.status === 'COMPLETE') {
      return generation;
    }

    if (generation.status === 'FAILED') {
      throw new Error('Leonardo generation failed');
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('Leonardo generation timed out after 2 minutes');
}

/**
 * Generate a clipart-style image using Leonardo AI.
 * If imageBase64 is provided, uses image-to-image (init image) for style transfer.
 * Otherwise falls back to text-to-image.
 */
export async function generateClipart(
  styleName: string,
  customPrompt?: string,
  imageBase64?: string
): Promise<string> {
  if (!imageBase64) {
    throw new Error('Please upload an image first before generating clipart.');
  }

  const apiKey = getApiKey();

  const styleModifier =
    stylePrompts[styleName] || 'clipart style, clean vector illustration';
  const basePrompt = customPrompt || 'a beautiful illustration';
  const fullPrompt = `${basePrompt}, ${styleModifier}, white background, high quality, professional clipart, detailed`;

  // Build the generation request body
  const body: Record<string, any> = {
    prompt: fullPrompt,
    modelId: LEONARDO_MODEL_ID,
    width: 1024,
    height: 1024,
    num_images: 1,
    alchemy: true,
    negative_prompt:
      'blurry, low quality, distorted, watermark, text, signature',
  };

  // Upload the source image and use image-to-image
  const initImageId = await uploadInitImage(imageBase64, apiKey);
  body.init_image_id = initImageId;
  // 0.3 = keep strong resemblance to original, with style applied
  body.init_strength = 0.3;

  // Create generation
  const createRes = await fetch(`${LEONARDO_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    if (createRes.status === 401 || createRes.status === 403) {
      throw new Error(
        'Invalid Leonardo API key. Please check EXPO_PUBLIC_LEONARDO_API_KEY in your .env file.'
      );
    }
    if (createRes.status === 402 || createRes.status === 429) {
      throw new Error(
        'Leonardo AI credits depleted or rate limited. Please check your account.'
      );
    }
    throw new Error(
      `Leonardo API error (${createRes.status}): ${errorText}`
    );
  }

  const createData = await createRes.json();
  const generationId = createData.sdGenerationJob?.generationId;

  if (!generationId) {
    throw new Error('Leonardo returned no generationId');
  }

  // Poll for completion
  const generation = await pollGeneration(generationId, apiKey);

  // Get the image URL
  const images = generation.generated_images;
  if (!images || images.length === 0) {
    throw new Error('Leonardo returned no generated images');
  }

  const imageUrl: string = images[0].url;
  if (!imageUrl) {
    throw new Error('Leonardo image has no URL');
  }

  // Fetch image and convert to base64 data URI
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(
      `Failed to download Leonardo image: ${imageResponse.status}`
    );
  }

  const blob = await imageResponse.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
