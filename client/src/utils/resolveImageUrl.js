const SERVER_ORIGIN = 'http://localhost:5000';

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  // If it's already a full URL (http/https), leave it as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // Otherwise it's a relative path from your backend (e.g. /uploads/xyz.jpg)
  return `${SERVER_ORIGIN}${imageUrl}`;
}