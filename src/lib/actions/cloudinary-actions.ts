'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Génère une signature sécurisée pour l'upload depuis le client.
 * Tous les paramètres envoyés dans la requête d'upload (sauf le fichier lui-même)
 * doivent être inclus dans la signature pour être acceptés par Cloudinary.
 */
export async function getCloudinarySignature(params: Record<string, any> = {}) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
  
  // Paramètres de base requis pour la signature
  const signatureParams = {
    ...params,
    timestamp,
    upload_preset: uploadPreset,
  };

  const signature = cloudinary.utils.api_sign_request(
    signatureParams,
    process.env.CLOUDINARY_API_SECRET!
  );

  return { 
    timestamp, 
    signature,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset
  };
}
