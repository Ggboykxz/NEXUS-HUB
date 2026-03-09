
'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import type { UserProfile, Story } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';
import { notFound } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Page de profil artiste utilisant le SDK Client.
 * Gère de manière résiliente les erreurs d'index Firestore.
 */
export default function ArtistPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const [data, setData] = useState<{ artist: UserProfile; stories: Story[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchArtistData() {
      try {
        setIndexError(false);
        // 1. Rechercher l'artiste par son slug
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('slug', '==', params.slug), limit(1));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          setLoading(false);
          return;
        }

        const artistDoc = userSnapshot.docs[0];
        const artist = { uid: artistDoc.id, ...artistDoc.data() } as UserProfile;

        // 2. Récupérer ses histoires publiées
        const storiesRef = collection(db, 'stories');
        let stories: Story[] = [];
        
        try {
          // Tentative avec tri (nécessite un index composite)
          const storiesQuery = query(
            storiesRef,
            where('artistId', '==', artist.uid),
            where('isPublished', '==', true),
            orderBy('updatedAt', 'desc')
          );
          const storiesSnapshot = await getDocs(storiesQuery);
          stories = storiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
        } catch (e: any) {
          // Fallback : Si l'index manque, on récupère sans trier
          if (e.code === 'failed-precondition' || e.message.includes('index')) {
            console.warn("Firestore Index missing, falling back to unsorted query.");
            const fallbackQuery = query(
              storiesRef,
              where('artistId', '==', artist.uid),
              where('isPublished', '==', true)
            );
            const fallbackSnapshot = await getDocs(fallbackQuery);
            stories = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
            setIndexError(true);
          } else {
            throw e;
          }
        }

        setData({ artist, stories });
      } catch (e) {
        console.error("Error fetching artist:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchArtistData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <>
      {indexError && process.env.NODE_ENV === 'development' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-xs text-amber-200 font-medium">
              Mode Dégradé : Un index Firestore est requis pour le tri. <br/>
              <span className="opacity-60 text-[10px]">L'affichage fonctionne sans tri en attendant.</span>
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-black" asChild>
            <a href="https://console.firebase.google.com/v1/r/project/studio-7543974359-3b6f7/firestore/indexes?create_composite=Cldwcm9qZWN0cy9zdHVkaW8tNzU0Mzk3NDM1OS0zYjZmNy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvc3Rvcmllcy9pbmRleGVzL18QARoMCghhcnRpc3RJZBABGg8KC2lzUHVibGlzaGVkEAEaDQoJdXBkYXRlZEF0EAIaDAoIX19uYW1lX18QAg" target="_blank" rel="noopener noreferrer">
              Créer l'Index
            </a>
          </Button>
        </div>
      )}
      <ArtistDetailClient artist={data.artist} artistStories={data.stories} />
    </>
  );
}
