export async function generateClipart(
  styleName: string,
  customPrompt?: string,
  imageBase64?: string,
  options?: { transparent?: boolean; intensity?: number }
): Promise<string> {
  if (!imageBase64) {
    throw new Error('Please upload an image first before generating clipart.');
  }

  // Security Rule: Route tightly to the local secure API Gateway
  // Android emulator requires 10.0.2.2 instead of localhost
  const endpoint = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/generate';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      styleName,
      customPrompt,
      imageBase64,
      options,
    }),
  });

  if (!response.ok) {
    let errorMsg = await response.text();
    try {
      const json = JSON.parse(errorMsg);
      if (json.error) errorMsg = json.error;
    } catch {}
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment before generating again.');
    }
    throw new Error(errorMsg || 'Backend proxy failed to process generation.');
  }

  const data = await response.json();
  if (!data.base64Output) {
    throw new Error('Backend proxy returned empty output mask.');
  }

  return data.base64Output;
}
