
const HF_TEXT2IMG_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';
const HF_IMG2IMG_URL = 'https://router.huggingface.co/hf-inference/models/timbrooks/instruct-pix2pix';

function getApiToken(): string {
  const token = process.env.EXPO_PUBLIC_HF_API_TOKEN;
  if (!token) {
    throw new Error(
      'Missing EXPO_PUBLIC_HF_API_TOKEN. Get one from https://huggingface.co/settings/tokens'
    );
  }
  return token;
}

/**
 * Style prompt modifiers for each clipart style.
 */
const stylePrompts: Record<string, string> = {
  'Cartoon': 'cartoon style, bold outlines, vibrant colors, playful, clean vector art',
  'Flat Illustration': 'flat illustration, minimal shadows, clean geometric shapes, modern vector style',
  'Anime': 'anime style, cel-shaded, vibrant, detailed line art, Japanese animation style',
  'Pixel Art': 'pixel art style, 16-bit, retro game aesthetic, pixelated',
  'Sketch / Outline': 'pencil sketch, hand-drawn outline, black and white line art, minimal shading',
};

/**
 * Generate a clipart-style image.
 * If `imageBase64` is provided, uses Image-to-Image (InstructPix2Pix).
 * Otherwise, uses Text-to-Image (SDXL).
 */
export async function generateClipart(
  styleName: string,
  customPrompt?: string,
  imageBase64?: string
): Promise<string> {
  const token = getApiToken();

  const styleModifier = stylePrompts[styleName] || 'clipart style, clean vector illustration';
  const basePrompt = customPrompt || 'a beautiful illustration';
  const fullPrompt = `${basePrompt}, ${styleModifier}, white background, high quality, professional clipart`;

  let response: Response;

  if (imageBase64) {
    // Image-to-Image using InstructPix2Pix
    response = await fetch(HF_IMG2IMG_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          image: imageBase64,
          prompt: `Convert this image to ${styleName} clipart style. ${fullPrompt}`,
        },
        parameters: {
          image_guidance_scale: 1.5,
          guidance_scale: 7.5,
          num_inference_steps: 25,
        },
      }),
    });
  } else {
    // Text-to-Image
    response = await fetch(HF_TEXT2IMG_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024,
        },
      }),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HuggingFace API error (${response.status}): ${errorText}`);
  }

  // The API returns the image as a blob
  const blob = await response.blob();

  // Convert blob to base64 data URI
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
