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
    displayName: user.displayName || 'Nouveau Lecteur',
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
 * Sécurisée par App Check (CSRF) et authentification.
 */
const StorySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  genre: z.string(),
  format: z.enum(['Webtoon', 'BD', 'Roman Illustré']),
});

export const submitStory = functions.https.onCall(async (data, context) => {
  // 1. Protection CSRF via App Check
  if (!context.app) {
    throw new functions.https.HttpsError('failed-precondition', 'La requête doit provenir d\'une application vérifiée.');
  }

  // 2. Vérification de l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté.');
  }

  // 3. Validation du schéma
  const validation = StorySchema.safeParse(data);
  if (!validation.success) {
    throw new functions.https.HttpsError('invalid-argument', 'Données de l\'œuvre invalides.');
  }

  const { title, description, genre, format } = validation.data;
  const artistId = context.auth.uid;

  // 4. Vérification du rôle artiste
  const userDoc = await db.collection('users').doc(artistId).get();
  const userData = userDoc.data();
  if (!userData || !['artist_draft', 'artist_pro'].includes(userData.role)) {
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
    status: 'ongoing',
    views: 0,
    likes: 0,
    isPremium: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    tags: []
  });

  return { id: storyRef.id, slug };
});

/**
 * Fonction Callable : Achat d'AfriCoins.
 * Sécurisée par App Check (CSRF).
 */
export const purchaseAfriCoins = functions.https.onCall(async (data, context) => {
  // Protection CSRF
  if (!context.app) {
    throw new functions.https.HttpsError('failed-precondition', 'La requête doit provenir d\'une application vérifiée.');
  }

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
    if (!userSnap.exists) throw "L'utilisateur n'existe pas.";

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
