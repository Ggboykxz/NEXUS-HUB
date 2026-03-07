'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Story, UserProfile, Chapter } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';
import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Page de détails des artistes utilisant le SDK Client pour éviter la complexité Admin.
 */
export default function ArtistProfilePage(props: PageProps) {
  const { slug } = use(props.params);
  const [data, setData] = useState<{ artist: UserProfile; artistStories: Story[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Trouver l'artiste par son slug
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef, 
          where('slug', '==', slug), 
          where('isBanned', '==', false),
          limit(1)
        );
        
        const snap = await getDocs(q);
        
        if (snap.empty) {
          // Fallback par UID si le slug n'est pas trouvé
          const directDoc = await getDoc(doc(db, 'users', slug));
          if (directDoc.exists() && !directDoc.data().isBanned) {
            const artist = { uid: directDoc.id, ...directDoc.data() } as UserProfile;
            await loadStories(artist);
          } else {
            setLoading(false);
          }
          return;
        }

        const artistDoc = snap.docs[0];
        const artist = { uid: artistDoc.id, ...artistDoc.data() } as UserProfile;
        await loadStories(artist);
      } catch (e) {
        console.error("Error fetching artist:", e);
        setLoading(false);
      }
    }

    async function loadStories(artist: UserProfile) {
      const storiesRef = collection(db, 'stories');
      const qStories = query(
        storiesRef,
        where('artistId', '==', artist.uid),
        where('isPublished', '==', true),
        orderBy('updatedAt', 'desc')
      );
      
      const storiesSnap = await getDocs(qStories);
      const stories = storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
      
      setData({ artist, artistStories: stories });
      setLoading(false);
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Appel du créateur...</p>
      </div>
    );
  }

  if (!data) return notFound();

  return <ArtistDetailClient artist={data.artist} artistStories={data.artistStories} />;
}
