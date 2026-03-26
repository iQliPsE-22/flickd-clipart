const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Security Rule: Basic rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many generation requests from this IP. Please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const LEONARDO_API_BASE = 'https://cloud.leonardo.ai/api/rest/v1';
const LEONARDO_MODEL_ID = '6b645e3a-d64f-4341-a6d8-7a3690fbf042';

const stylePrompts = {
  'Cartoon': 'cartoon style, bold outlines, vibrant colors, playful, clean vector art, 3D dimensional',
  'Flat Illustration': 'flat illustration, minimal shadows, clean geometric shapes, modern vector style, editorial minimal',
  'Anime': 'anime style, cel-shaded, vibrant, detailed line art, Japanese animation style',
  'Pixel Art': 'pixel art style, 16-bit, retro game aesthetic, pixelated, nostalgic',
  'Sketch / Outline': 'pencil sketch, hand-drawn outline, black and white line art, minimal shading',
};

function getApiKey() {
  const key = process.env.LEONARDO_API_KEY;
  if (!key) throw new Error('Backend missing LEONARDO_API_KEY');
  return key; // No longer exposed to frontend
}

async function uploadInitImage(imageBase64, apiKey) {
  const initRes = await fetch(`${LEONARDO_API_BASE}/init-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ extension: 'jpg' }),
  });

  if (!initRes.ok) throw new Error(`Leonardo init error: ${await initRes.text()}`);

  const initData = await initRes.json();
  const fields = initData.uploadInitImage?.fields;
  const uploadUrl = initData.uploadInitImage?.url;
  const imageId = initData.uploadInitImage?.id;

  if (!uploadUrl || !imageId || !fields) throw new Error('Incomplete init data');

  const rawBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const buffer = Buffer.from(rawBase64, 'base64');
  const blob = new Blob([buffer], { type: 'image/jpeg' });

  const formData = new FormData();
  const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields;
  for (const [key, value] of Object.entries(parsedFields)) {
    formData.append(key, value);
  }
  formData.append('file', blob, 'image.jpg');

  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
  if (!uploadRes.ok && uploadRes.status !== 204) {
    throw new Error(`S3 upload error: ${await uploadRes.text()}`);
  }

  return imageId;
}

async function pollGeneration(generationId, apiKey) {
  for (let i = 0; i < 60; i++) {
    const res = await fetch(`${LEONARDO_API_BASE}/generations/${generationId}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Poll error: ${await res.text()}`);
    const data = await res.json();
    const generation = data.generations_by_pk;
    if (generation.status === 'COMPLETE') return generation;
    if (generation.status === 'FAILED') throw new Error('Generation failed');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Timeout');
}

app.post('/api/generate', async (req, res) => {
  try {
    const { styleName, customPrompt, imageBase64, options } = req.body;

    // Security Rule: Input constraints and validation
    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.length < 100) {
      return res.status(400).json({ error: 'Invalid or missing image payload' });
    }
    if (!styleName || typeof styleName !== 'string' || styleName.length > 50) {
      return res.status(400).json({ error: 'Invalid style payload' });
    }
    if (customPrompt && (typeof customPrompt !== 'string' || customPrompt.length > 200)) {
      return res.status(400).json({ error: 'Custom prompt exceeds 200 characters strict safety buffer' });
    }

    const apiKey = getApiKey();
    const styleModifier = stylePrompts[styleName] || 'clipart style';
    const identityPrompt = 'perfectly match original photo subject, strict facial resemblance, same gender, same ethnicity';
    const basePrompt = customPrompt ? `${customPrompt}, ${identityPrompt}` : `${identityPrompt}, stunning illustration`;
    const bgPrompt = options?.transparent ? 'isolated on transparent background' : 'solid white background';
    
    const fullPrompt = `(masterpiece), high quality, ${styleModifier}, ${bgPrompt}, ${basePrompt}`;

    const initImageId = await uploadInitImage(imageBase64, apiKey);
    
    const userIntensity = options?.intensity !== undefined ? options.intensity : 15;
    const mappedStrength = 0.9 - (userIntensity / 100) * 0.6;
    const strength = Math.max(0.1, Math.min(0.9, parseFloat(mappedStrength.toFixed(2))));

    const body = {
      prompt: fullPrompt,
      modelId: LEONARDO_MODEL_ID,
      width: 1024,
      height: 1024,
      num_images: 1,
      alchemy: true,
      init_image_id: initImageId,
      init_strength: strength,
      negative_prompt: 'different person, mutated, morphed, bad anatomy, deformed, signature, watermark',
    };

    const createRes = await fetch(`${LEONARDO_API_BASE}/generations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!createRes.ok) throw new Error(`Init Gen Error: ${await createRes.text()}`);
    const generationId = (await createRes.json()).sdGenerationJob?.generationId;

    const generation = await pollGeneration(generationId, apiKey);
    const imageUrl = generation.generated_images?.[0]?.url;
    if (!imageUrl) throw new Error('No image URL');

    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    let finalBase64 = Buffer.from(arrayBuffer).toString('base64');

    if (options?.transparent) {
      const rbKey = process.env.REMOVE_BG_API_KEY;
      if (rbKey) {
        const bgRes = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: { "X-Api-Key": rbKey, "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ image_file_b64: finalBase64, size: "auto", format: "png" }),
        });
        if (bgRes.ok) {
          const bgData = await bgRes.json();
          if (bgData.data && bgData.data.result_b64) {
             finalBase64 = bgData.data.result_b64;
          }
        }
      }
    }

    res.json({ base64Output: `data:image/png;base64,${finalBase64}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal API proxy error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API Gateway running securely on port ${PORT}`);
});

module.exports = app;
