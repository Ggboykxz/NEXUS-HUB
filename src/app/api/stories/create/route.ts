import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const CreateStorySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  genre: z.string().min(2),
  format: z.enum(['Webtoon', 'BD', 'One-shot', 'Roman Illustré', 'Hybride']),
  universeId: z.string().max(50).optional(),
  universeRelation: z.enum(['Préquel', 'Séquelle', 'Spin-off', 'Original']).optional(),
});

export async function POST(request: Request) {
  const { adminAuth, adminDb, adminStorage } = getAdminServices();

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
    const coverFile = formData.get('cover');
    
    if (!(coverFile instanceof File)) {
      return NextResponse.json({ error: 'Image de couverture manquante ou invalide' }, { status: 400 });
    }

    if (coverFile.size > 10 * 1024 * 1024) { // 10 Mo
      return NextResponse.json({ error: 'Fichier trop lourd (max 10Mo)' }, { status: 400 });
    }

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      genre: formData.get('genre'),
      format: formData.get('format'),
      universeId: formData.get('universeId') || undefined,
      universeRelation: formData.get('universeRelation') || 'Original',
    };

    // 3. Validation du schéma Zod
    const validation = CreateStorySchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides', details: validation.error.format() }, { status: 400 });
    }

    const { title, description, genre, format, universeId, universeRelation } = validation.data;

    // 4. Génération et vérification du slug
    let slug = title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')       // Supprime les caractères non alphanumériques
      .replace(/[\s_-]+/g, '-')        // Remplace les espaces et tirets par un seul tiret
      .replace(/^-+|-+$/g, '');        // Supprime les tirets de début et de fin
    
    const existingSnap = await adminDb.collection('stories').where('slug', '==', slug).get();
    if (!existingSnap.empty) {
      slug = `${slug}-${Date.now()}`; // Ajoute un timestamp pour garantir l'unicité
    }

    // 5. Upload de l'image vers Cloud Storage
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const bucket = adminStorage.bucket();
    const filePath = `covers/${uid}/${slug}-${coverFile.name}`;
    const file = bucket.file(filePath);

    await file.save(buffer, {
      metadata: { contentType: coverFile.type },
      public: true, // Le fichier est accessible publiquement
    });

    // L'URL publique est standard et prédictible avec Firebase Storage
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // 6. Écriture des métadonnées de l'histoire dans Firestore
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
      coverImage: { imageUrl: publicUrl },
      universeId: universeId || null,
      universeRelation: universeId ? universeRelation : 'Original',
      isPublished: false,
      isBanned: false,
      isOriginal: true,
      isPremium: false,
      views: 0,
      likes: 0,
      subscriptions: 0,
      chapterCount: 0,
      rating: 0,
      tags: [genre],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await storyRef.set(storyData);

    return NextResponse.json({ id: storyRef.id, slug }, { status: 201 });

  } catch (error: any) {
    console.error('API Story Creation Error:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Le jeton d\'authentification a expiré.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur interne du serveur', message: error.message }, { status: 500 });
  }
}
