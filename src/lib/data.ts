
import { db } from './firebase';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import type { Story, UserProfile, Chapter, Playlist, Product, BlogPost, Forum, Thread, Comment, ComicPage } from './types';

// ==================== HELPERS ====================
// Ré-exportation des helpers d'URL et des types pour la compatibilité
export { getStoryUrl, getChapterUrl, getUserUrl } from './types';
export type { Story, UserProfile as Artist, Chapter, UserRole as ArtistRole } from './types';

// ==================== FONCTIONS DE RÉCUPÉRATION DE DONNÉES ====================

/**
 * Récupère une liste d'histoires depuis Firestore.
 * @param count Limite le nombre d'histoires à récupérer.
 * @returns Une promesse qui résout en un tableau d'objets Story.
 */
export async function getStories(count: number = 20): Promise<Story[]> {
  try {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, where('isPublished', '==', true), orderBy('publishedAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn('Aucune histoire publiée trouvée dans Firestore.');
      return [];
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
  } catch (error) {
    console.error("Erreur lors de la récupération des histoires:", error);
    return []; // Retourne un tableau vide en cas d'erreur
  }
}

/**
 * Récupère une liste d'artistes depuis Firestore.
 * @param count Limite le nombre d'artistes à récupérer.
 * @returns Une promesse qui résout en un tableau d'objets UserProfile.
 */
export async function getArtists(count: number = 20): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    // Cible les différents rôles d'artistes
    const q = query(usersRef, where('role', 'in', ['artist_pro', 'artist_elite']), limit(count));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('Aucun artiste trouvé dans Firestore.');
      return [];
    }

    return snapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error("Erreur lors de la récupération des artistes:", error);
    return [];
  }
}

/**
 * Placeholder pour récupérer les pages d'une BD (Comic).
 * À implémenter avec la logique métier réelle.
 */
export async function getComicPages(storyId: string, chapterId: string): Promise<ComicPage[]> {
  console.warn('getComicPages n\'est pas encore implémenté.');
  return [];
}

/**
 * Placeholder pour récupérer les commentaires.
 */
export async function getComments(storyId: string): Promise<Comment[]> {
  console.warn('getComments n\'est pas encore implémenté.');
  return [];
}

// ... Vous pouvez ajouter ici les autres fonctions de récupération pour playlists, products, etc.
// sur le même modèle que getStories et getArtists.
