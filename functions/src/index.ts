
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';

admin.initializeApp();

const db = admin.firestore();

/**
 * Déclencheur : Création automatique du profil Firestore lors de l'inscription Auth.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection('users').doc(user.uid);
  
  return userRef.set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Nouveau Voyageur',
    photoURL: user.photoURL || 'https://picsum.photos/seed/default/200/200',
    role: 'reader',
    afriCoins: 0,
    bio: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    favorites: [],
    following: []
  }, { merge: true });
});

/**
 * Fonction Callable : Validation et soumission d'une nouvelle œuvre.
 */
const StorySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  genre: z.string(),
  format: z.enum(['Webtoon', 'BD', 'Roman Illustré', 'One-shot', 'Hybride']),
});

export const submitStory = functions.https.onCall(async (data, context) => {
  // Vérification de l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté.');
  }

  // Validation du schéma
  const validation = StorySchema.safeParse(data);
  if (!validation.success) {
    throw new functions.https.HttpsError('invalid-argument', 'Données de l\'œuvre invalides.');
  }

  const { title, description, genre, format } = validation.data;
  const artistId = context.auth.uid;

  // Vérification du rôle artiste
  const userDoc = await db.collection('users').doc(artistId).get();
  const userData = userDoc.data();
  if (!userData || !['artist_draft', 'artist_pro', 'artist_elite'].includes(userData.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Seuls les artistes peuvent publier.');
  }

  const storyRef = db.collection('stories').doc();
  const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

  await storyRef.set({
    id: storyRef.id,
    slug,
    title,
    description,
    genre,
    genreSlug: genre.toLowerCase(),
    format,
    artistId,
    artistName: userData.displayName,
    status: 'En cours',
    views: 0,
    likes: 0,
    isPremium: false,
    isPublished: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    tags: [genre]
  });

  return { id: storyRef.id, slug };
});

/**
 * Fonction Callable : Achat d'AfriCoins.
 */
export const purchaseAfriCoins = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Session expirée.');
  }

  const { amount, packId } = data;
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Montant invalide.');
  }

  const userRef = db.collection('users').doc(context.auth.uid);

  return db.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists) throw new functions.https.HttpsError('not-found', "L'utilisateur n'existe pas.");

    const currentCoins = userSnap.data()?.afriCoins || 0;
    transaction.update(userRef, { 
      afriCoins: currentCoins + amount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const transRef = db.collection('transactions').doc();
    transaction.set(transRef, {
      userId: context.auth!.uid,
      amount,
      type: 'purchase',
      packId,
      status: 'completed',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { newBalance: currentCoins + amount };
  });
});
