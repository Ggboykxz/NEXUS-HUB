import { NextResponse } from 'next/server';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase-admin';
import { z } from 'zod';

const CreateStorySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  genre: z.string().min(2),
  format: z.enum(['Webtoon', 'BD', 'One-shot', 'Roman Illustré', 'Hybride']),
});

export async function POST(request: Request) {
  try {
    // 1. Authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Récupération des données (FormData)
    const formData = await request.formData();
    const coverFile = formData.get('cover') as File;
    
    if (!coverFile) {
      return NextResponse.json({ error: 'Image de couverture manquante' }, { status: 400 });
    }

    if (coverFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop lourd (max 10Mo)' }, { status: 400 });
    }

    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      genre: formData.get('genre') as string,
      format: formData.get('format') as any,
    };

    // 3. Validation du schéma
    const validation = CreateStorySchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides', details: validation.error.format() }, { status: 400 });
    }

    const { title, description, genre, format } = validation.data;

    // 4. Génération et vérification du slug
    let slug = title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const existingSnap = await adminDb.collection('stories').where('slug', '==', slug).get();
    if (!existingSnap.empty) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 5. Upload de l'image vers Storage via Admin SDK
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const bucket = adminStorage.bucket();
    const filePath = `covers/${uid}/${Date.now()}_cover.jpg`;
    const file = bucket.file(filePath);

    await file.save(buffer, {
      metadata: { contentType: 'image/jpeg' },
      public: true
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // 6. Écriture finale dans Firestore
    const storyRef = adminDb.collection('stories').doc();
    const storyData = {
      id: storyRef.id,
      slug,
      title,
      description,
      genre,
      genreSlug: genre.toLowerCase(),
      format,
      artistId: uid,
      artistName: decodedToken.name || 'Artiste Nexus',
      coverImage: {
        imageUrl: publicUrl,
        width: 0,
        height: 0
      },
      isPublished: false,
      isBanned: false,
      isOriginal: false,
      isPremium: false,
      views: 0,
      likes: 0,
      subscriptions: 0,
      chapterCount: 0,
      rating: 0,
      tags: [genre],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await storyRef.set(storyData);

    return NextResponse.json({ id: storyRef.id, slug }, { status: 201 });

  } catch (error: any) {
    console.error('API Creation Error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur', message: error.message }, { status: 500 });
  }
}
