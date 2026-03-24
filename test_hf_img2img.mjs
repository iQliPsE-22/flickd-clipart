// test_hf_img2img.js
import fs from 'fs';

const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';
const token = process.env.EXPO_PUBLIC_HF_API_TOKEN || '';

async function test() {
  // Let's create a dummy 1x1 image in base64
  const dummyImageB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  // Let's try sending it as JSON with inputs = base64 image and prompt in parameters
  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: dummyImageB64,
        parameters: {
          prompt: "make it red",
        }
      })
    });
    console.log("Status:", response.status);
    if (!response.ok) {
        console.log("Error:", await response.text());
    } else {
        console.log("Success!");
    }
  } catch(e) {
    console.error(e);
  }
}

test();
