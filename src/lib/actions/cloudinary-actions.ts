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
  
  // Vérification de la présence du secret pour éviter les signatures invalides
  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error("ERREUR : CLOUDINARY_API_SECRET est manquant dans le fichier .env");
    throw new Error("Configuration serveur incomplète (Secret manquant).");
  }

  // Cloudinary signe les paramètres triés par ordre alphabétique.
  // On ne signe que folder et timestamp pour correspondre à la requête cliente simplifiée.
  const signature = cloudinary.utils.api_sign_request(
    {
      folder: params.folder,
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
