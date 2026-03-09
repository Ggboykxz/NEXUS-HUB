
'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, orderBy } from 'firebase/firestore';
import type { UserProfile, Story } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Page de profil artiste convertie en Client Component pour utiliser le SDK Client.
 */
export default function ArtistPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const [data, setData] = useState<{ artist: UserProfile; stories: Story[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtistData() {
      try {
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
        const storiesQuery = query(
          storiesRef,
          where('artistId', '==', artist.uid),
          where('isPublished', '==', true),
          orderBy('updatedAt', 'desc')
        );
        
        const storiesSnapshot = await getDocs(storiesQuery);
        const stories = storiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));

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

  return <ArtistDetailClient artist={data.artist} artistStories={data.stories} />;
}
