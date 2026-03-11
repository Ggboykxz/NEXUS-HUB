/**
 * @fileOverview Utilitaires pour la transformation et l'optimisation automatique des images.
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfzrjuaap';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
  crop?: 'fill' | 'scale' | 'thumb' | 'fit' | 'pad' | 'lfill' | 'limit';
  gravity?: 'auto' | 'center' | 'face' | 'north' | 'south';
  lowData?: boolean;
  aspectRatio?: string; // e.g. "2:3", "1:1", "16:9"
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
      quality = options.lowData ? 30 : 'auto',
      format = 'auto',
      crop = 'fill',
      gravity = 'auto',
      aspectRatio
    } = options;

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    // En mode low data, on force également une largeur maximale plus petite
    const effectiveWidth = options.lowData && typeof width === 'number' ? Math.min(width, 400) : width;

    const transformation = [
      effectiveWidth !== 'auto' ? `w_${effectiveWidth}` : '',
      height ? `h_${height}` : '',
      aspectRatio ? `ar_${aspectRatio}` : '',
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
 * Utilise g_auto pour centrer sur le sujet (personnage)
 */
export function getCoverThumbnail(url: string, lowData: boolean = false) {
  return getOptimizedImage(url, {
    width: 600,
    aspectRatio: '2:3',
    crop: 'fill',
    gravity: 'auto',
    quality: lowData ? 20 : 'auto',
    lowData
  });
}

/**
 * Helper spécifique pour les avatars (Carré)
 * Utilise g_face pour centrer sur le visage
 */
export function getAvatarThumbnail(url: string) {
  return getOptimizedImage(url, {
    width: 200,
    height: 200,
    aspectRatio: '1:1',
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto'
  });
}

/**
 * Helper pour les bannières larges
 */
export function getBannerOptimized(url: string) {
  return getOptimizedImage(url, {
    width: 1200,
    aspectRatio: '21:9',
    crop: 'lfill',
    gravity: 'auto',
    quality: 'auto'
  });
}

/**
 * Helper pour les pages de lecture (Webtoon / BD)
 * Gère l'adaptation à la largeur tout en préservant les détails
 */
export function getReaderPageOptimized(url: string, mode: 'scroll' | 'pages', lowData: boolean = false) {
  return getOptimizedImage(url, {
    width: mode === 'scroll' ? 1000 : 1200,
    crop: mode === 'scroll' ? 'limit' : 'fit',
    quality: lowData ? 30 : 85,
    format: 'auto',
    lowData
  });
}
