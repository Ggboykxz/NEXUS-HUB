
'use server';

import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary avec les variables d'environnement.
 */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Génère une signature pour un upload signé vers Cloudinary.
 * Cela permet de garder la clé secrète sur le serveur.
 */
export async function getCloudinarySignature() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return { 
    timestamp, 
    signature,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  };
}

/**
 * Fonction utilitaire pour uploader une image depuis le serveur.
 */
export async function uploadToServerSideCloudinary(base64Image: string) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'nexushub/stories',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Échec de l\'envoi vers Cloudinary');
  }
}
