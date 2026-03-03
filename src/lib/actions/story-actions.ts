'use server';

import { adminDb, adminStorage, adminAuth } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const StorySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  genre: z.string(),
  format: z.enum(['Webtoon', 'BD', 'One-shot', 'Roman Illustré', 'Hybride']),
  isPremium: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

/**
 * Crée une nouvelle œuvre dans Firestore.
 */
export async function createStory(formData: FormData, userId: string) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const genre = formData.get('genre') as string;
    const format = formData.get('format') as any;
    const coverFile = formData.get('cover') as File;

    if (!coverFile) throw new Error("Image de couverture requise.");

    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    
    // Upload image vers Storage
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const bucket = adminStorage.bucket();
    const filePath = `stories/${userId}/${Date.now()}_cover.jpg`;
    const file = bucket.file(filePath);
    await file.save(buffer, { metadata: { contentType: 'image/jpeg' } });
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    const storyRef = adminDb.collection('stories').doc();
    await storyRef.set({
      id: storyRef.id,
      slug,
      title,
      description,
      genre,
      genreSlug: genre.toLowerCase(),
      format,
      artistId: userId,
      coverImage: { imageUrl },
      views: 0,
      likes: 0,
      chapterCount: 0,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    revalidatePath('/dashboard/creations');
    return { success: true, id: storyRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Supprime une œuvre et ses données associées.
 */
export async function deleteStory(storyId: string, userId: string) {
  try {
    const storyRef = adminDb.collection('stories').doc(storyId);
    const doc = await storyRef.get();
    
    if (!doc.exists || doc.data()?.artistId !== userId) {
      throw new Error("Action non autorisée.");
    }

    await storyRef.delete();
    revalidatePath('/dashboard/creations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
