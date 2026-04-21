// Client-side image resize + base64 encode, so we can save photos
// directly into Firestore (under the 1MB-per-doc limit) without needing
// Firebase Storage to be enabled.

export async function fileToResizedDataURL(file, {
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.75,
  mime = 'image/jpeg'
} = {}) {
  if (!file || !file.type?.startsWith('image/')) throw new Error('Not an image file');

  const dataURL = await readFile(file);
  const img = await loadImage(dataURL);

  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  return canvas.toDataURL(mime, quality);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Returns approximate data-URL byte size
export function dataURLSize(dataURL) {
  if (!dataURL) return 0;
  const base64 = dataURL.split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
}
