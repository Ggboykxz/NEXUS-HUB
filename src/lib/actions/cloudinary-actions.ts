'use server';

import { v2 as cloudinary } from 'cloudinary';

/**
 * Configuration de Cloudinary.
 * Note : Le SECRET doit rester strictement côté serveur.
 */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Génère une signature sécurisée pour l'upload depuis le client.
 * @param params Les paramètres à inclure dans la signature (ex: folder).
 */
export async function getCloudinarySignature(params: Record<string, any> = {}) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // On s'assure que le secret est présent pour éviter une signature vide/invalide
  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error("ERREUR : CLOUDINARY_API_SECRET est manquant dans le fichier .env");
    throw new Error("Configuration serveur incomplète (Secret manquant).");
  }

  // Cloudinary signe les paramètres triés par ordre alphabétique
  const signature = cloudinary.utils.api_sign_request(
    {
      ...params,
      timestamp,
    },
    process.env.CLOUDINARY_API_SECRET
  );

  return { 
    timestamp, 
    signature,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  };
}
