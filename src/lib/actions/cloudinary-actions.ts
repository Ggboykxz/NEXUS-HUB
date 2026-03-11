'use server';

import { v2 as cloudinary } from 'cloudinary';

// It's not strictly necessary to configure here if we do it in each function,
// but it can be useful for other server-side Cloudinary operations in this file.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generates a secure signature for client-side uploads.
 * @param params The parameters to include in the signature (e.g., folder).
 */
export async function getCloudinarySignature(params: Record<string, any> = {}) {
  // Re-configure on each call to ensure env vars are fresh, especially in a serverless environment
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error("ERROR: CLOUDINARY_API_SECRET is missing from .env file");
    throw new Error("Server configuration is incomplete (Missing Secret).");
  }
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.error("ERROR: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing from .env file");
    throw new Error("Server configuration is incomplete (Missing Cloud Name).");
  }
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
    console.error("ERROR: NEXT_PUBLIC_CLOUDINARY_API_KEY is missing from .env file");
    throw new Error("Server configuration is incomplete (Missing API Key).");
  }


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
