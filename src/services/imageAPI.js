// Pollinations.ai — free image generation, no API key required.
// Docs: https://image.pollinations.ai/

const BASE = 'https://image.pollinations.ai/prompt';

export function getComicImageURL(panel, data) {
  const style = stylePhrase(data?.genre);
  const query = panel.photoQuery || `${panel.place} ${panel.action}`;
  // Shorter prompt = faster response from Pollinations
  const prompt = `${query}, ${panel.place}, ${style}, comic panel, halftone, bold ink outlines, flat colors, no text`;
  const seed = deterministicSeed(`${data?.mood || ''}-${panel.order}`);
  const params = new URLSearchParams({
    width: '512',
    height: '320',
    nologo: 'true',
    seed: String(seed)
  });
  return `${BASE}/${encodeURIComponent(prompt)}?${params.toString()}`;
}

function stylePhrase(genre) {
  const map = {
    noir: 'noir comic book style, high contrast black and white with selective red',
    action: 'dynamic action comic style, bold lines, motion blur, Kirby-inspired',
    mystery: 'dark mystery comic, moody purple and deep blue palette, shadowy',
    romance: 'soft romantic comic style, pastel pink and gold palette, delicate lines',
    adventure: 'adventure comic style, bold colors, cinematic angles, Tintin-inspired',
    'slice-of-life': 'warm slice-of-life comic, soft watercolor tones, cozy',
  };
  return map[genre] || 'vintage comic book style, halftone';
}

function deterministicSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 10_000;
}

export async function preloadImages(urls) {
  return Promise.allSettled(
    urls.map((url) => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(url);
      img.src = url;
    }))
  );
}
