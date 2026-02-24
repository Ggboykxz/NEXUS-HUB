/**
 * @fileOverview Utilitaires pour la transformation et l'optimisation automatique des images.
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
  crop?: 'fill' | 'scale' | 'thumb' | 'fit';
  gravity?: 'auto' | 'center' | 'face';
  lowData?: boolean;
}

/**
 * Génère une URL d'image optimisée via Cloudinary.
 * Si l'URL n'est pas une URL Cloudinary, retourne l'URL originale.
 */
export function getOptimizedImage(url: string, options: ImageTransformOptions = {}): string {
  if (!url) return '';
  
  if (url.includes('res.cloudinary.com')) {
    const {
      width = 'auto',
      height,
      quality = options.lowData ? 30 : 'auto', // Réduit drastiquement la qualité en mode Low-Data
      format = 'auto',
      crop = 'fill',
      gravity = 'auto'
    } = options;

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    // En mode low data, on force également une largeur maximale plus petite
    const effectiveWidth = options.lowData && typeof width === 'number' ? Math.min(width, 400) : width;

    const transformation = [
      effectiveWidth !== 'auto' ? `w_${effectiveWidth}` : '',
      height ? `h_${height}` : '',
      `c_${crop}`,
      `g_${gravity}`,
      `q_${quality}`,
      `f_${format}`
    ].filter(Boolean).join(',');

    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  }

  return url;
}

/**
 * Helper spécifique pour les couvertures de BD (Ratio 2:3)
 */
export function getCoverThumbnail(url: string, lowData: boolean = false) {
  return getOptimizedImage(url, {
    width: 400,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: lowData ? 20 : 80,
    lowData
  });
}

/**
 * Helper spécifique pour les avatars (Carré)
 */
export function getAvatarThumbnail(url: string) {
  return getOptimizedImage(url, {
    width: 150,
    height: 150,
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto'
  });
}
