'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Users, Award, PenSquare, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtists() {
      try {
        const q = query(collection(db, 'users'), where('role', 'in', ['artist_draft', 'artist_pro']));
        const snap = await getDocs(q);
        setArtists(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  const proArtists = artists.filter(a => a.role === 'artist_pro');
  const draftArtists = artists.filter(a => a.role === 'artist_draft');

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Users className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">Nos Artistes</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Découvrez les esprits créatifs de NexusHub. Des maîtres certifiés du programme Pro aux nouveaux talents prometteurs de l'espace Draft.
      </p>

      {/* Pro Section */}
      <section className="mb-24 relative p-8 rounded-3xl bg-emerald-500/[0.02] border border-emerald-500/10">
        <div className="flex items-center gap-3 mb-12">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Award className="text-emerald-500 h-8 w-8" />
            </div>
            <div>
                <h2 className="text-3xl font-bold font-display tracking-tight text-emerald-500">NexusHub Pro</h2>
                <p className="text-sm text-muted-foreground">L'excellence de la narration visuelle africaine.</p>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {proArtists.map((artist) => (
            <Link key={artist.id} href={`/artiste/${artist.slug}`} className="block h-full group">
                <div className="text-center transition-all h-full flex flex-col items-center">
                    <Avatar className="h-40 w-40 border-4 border-background ring-4 ring-emerald-500/20 mb-6 transition-all group-hover:ring-emerald-500 shadow-xl">
                        <AvatarImage src={artist.photoURL} alt={artist.displayName} />
                        <AvatarFallback>{artist.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-display font-bold group-hover:text-emerald-500 transition-colors mb-2">{artist.displayName}</h3>
                    <Badge variant="default" className="gap-1 text-[10px] bg-emerald-500 hover:bg-emerald-600 border-none uppercase tracking-widest px-3 py-1">
                        <Award className="h-3 w-3" />
                        Certifié Pro
                    </Badge>
                </div>
            </Link>
            ))}
        </div>
      </section>

      {/* Draft Section */}
      <section className="p-8 rounded-3xl bg-muted/30 border border-dashed border-orange-400/20">
        <div className="flex items-center gap-3 mb-12">
            <div className="bg-orange-400/10 p-2 rounded-lg">
                <PenSquare className="text-orange-400 h-8 w-8" />
            </div>
            <div>
                <h2 className="text-3xl font-bold font-display tracking-tight text-orange-400">NexusHub Draft</h2>
                <p className="text-sm text-muted-foreground">Les nouveaux visages du 9ème art africain.</p>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {draftArtists.map((artist) => (
            <Link key={artist.id} href={`/artiste/${artist.slug}`} className="block h-full group">
                <div className="text-center transition-all h-full flex flex-col items-center">
                    <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-orange-400/30 mb-4 transition-all group-hover:ring-orange-400/60 grayscale-[0.5] group-hover:grayscale-0">
                        <AvatarImage src={artist.photoURL} alt={artist.displayName} />
                        <AvatarFallback>{artist.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-display font-semibold group-hover:text-orange-400 transition-colors mb-2">{artist.displayName}</h3>
                    <Badge variant="outline" className="gap-1 text-[10px] border-orange-400/50 text-orange-400 uppercase tracking-widest px-2 py-0.5">
                        <PenSquare className="h-3 w-3" />
                        Talent Draft
                    </Badge>
                </div>
            </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
