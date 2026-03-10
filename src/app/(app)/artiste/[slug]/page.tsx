'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import type { UserProfile, Story } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';
import { notFound } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function ArtistPageSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 space-y-12">
      <div className="flex flex-col items-center text-center space-y-4">
        <Skeleton className="h-32 w-32 rounded-full bg-stone-900 border-4 border-stone-800" />
        <Skeleton className="h-8 w-48 bg-stone-900" />
        <Skeleton className="h-4 w-24 bg-stone-900/50" />
      </div>
      <div className="bg-stone-900/30 border border-white/5 rounded-2xl p-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-stone-800" />
          <Skeleton className="h-4 w-32 bg-stone-800/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full bg-stone-900 animate-pulse rounded-xl border border-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

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
    return <ArtistPageSkeleton />;
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
            <a href="https://console.firebase.google.com/v1/r/project/studio-7543974359-3b6f7/firestore/indexes" target="_blank" rel="noopener noreferrer">
              Créer l'Index
            </a>
          </Button>
        </div>
      )}
      <ArtistDetailClient artist={data.artist} artistStories={data.stories} />
    </>
  );
}
