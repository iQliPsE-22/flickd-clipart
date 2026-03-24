const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';

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
  'Cartoon': 'cartoon style, bold outlines, vibrant colors, playful, clean vector art, 3D dimensional',
  'Flat Illustration': 'flat illustration, minimal shadows, clean geometric shapes, modern vector style, editorial minimal',
  'Anime': 'anime style, cel-shaded, vibrant, detailed line art, Japanese animation style',
  'Pixel Art': 'pixel art style, 16-bit, retro game aesthetic, pixelated, nostalgic',
  'Sketch / Outline': 'pencil sketch, hand-drawn outline, black and white line art, minimal shading',
};

/**
 * Generate a clipart-style image using text-to-image.
 * The uploaded source image is used as context in the prompt.
 */
export async function generateClipart(
  styleName: string,
  customPrompt?: string,
  _imageBase64?: string
): Promise<string> {
  const token = getApiToken();

  const styleModifier = stylePrompts[styleName] || 'clipart style, clean vector illustration';
  const basePrompt = customPrompt || 'a beautiful illustration';
  const fullPrompt = `${basePrompt}, ${styleModifier}, white background, high quality, professional clipart, detailed`;

  const response = await fetch(HF_API_URL, {
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
