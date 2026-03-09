
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';

/**
 * Liste des artistes convertie en Client Component.
 */
export default function ArtistesPage() {
  const [artists, setArtists] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtists() {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', 'in', ['artist_draft', 'artist_pro', 'artist_elite']), limit(50));
        const snapshot = await getDocs(q);
        setArtists(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Appel des créateurs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <header className="mb-12 text-center space-y-4">
        <div className="bg-primary/10 p-3 rounded-2xl w-fit mx-auto">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-white">Nos <span className="gold-resplendant">Artistes</span></h1>
        <p className="text-lg text-stone-400 max-w-2xl mx-auto italic font-light">Découvrez les créateurs qui donnent vie à nos univers.</p>
      </header>
      
      {artists.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
          <p className="text-stone-500 italic">Aucun artiste n'a encore rejoint le Hub.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artists.map(artist => (
            <Link key={artist.uid} href={`/artiste/${artist.slug}`}>
              <Card className="flex flex-col items-center p-6 text-center transition-all duration-500 border-white/5 bg-white/5 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-1 group">
                <Avatar className="h-24 w-24 mb-4 border-2 border-transparent group-hover:border-primary transition-all">
                  <AvatarImage src={artist.photoURL} />
                  <AvatarFallback className="bg-stone-800 text-white font-bold">{artist.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-white truncate w-full group-hover:text-primary transition-colors">{artist.displayName}</h3>
                <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest mt-1">@{artist.slug}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
