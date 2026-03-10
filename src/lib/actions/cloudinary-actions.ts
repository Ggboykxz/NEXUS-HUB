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
 * Seuls les paramètres envoyés au client doivent être signés.
 */
export async function getCloudinarySignature(params: Record<string, any> = {}) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Paramètres à signer (doivent correspondre exactement à ceux envoyés par le client)
  const signatureParams = {
    ...params,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    signatureParams,
    process.env.CLOUDINARY_API_SECRET!
  );

  return { 
    timestamp, 
    signature,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  };
}
