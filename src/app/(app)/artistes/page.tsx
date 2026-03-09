import { db } from '@/lib/firebase-admin';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

async function getArtists() {
    const usersRef = db.collection('users');
    const artistQuery = usersRef.where('role', 'in', ['artist', 'artist-pro']);
    const snapshot = await artistQuery.get();

    if (snapshot.empty) {
        return [];
    }

    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
}

export default async function ArtistesPage() {
    const artists = await getArtists();

    return (
        <div className="container mx-auto max-w-7xl px-6 py-12">
            <header className="mb-12 text-center">
                 <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-white">Nos <span className="gold-resplendant">Artistes</span></h1>
                 <p className="text-lg text-stone-400 max-w-2xl mx-auto italic font-light mt-4">Découvrez les créateurs qui donnent vie à nos univers.</p>
            </header>
            
            {artists.length === 0 ? (
                <p className="text-center text-stone-400">Aucun artiste trouvé.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {artists.map(artist => (
                        <Link key={artist.uid} href={`/artiste/${artist.slug}`}>
                            <Card className="flex flex-col items-center p-4 text-center transition-all duration-300 border-white/5 bg-white/5 hover:border-primary/50 hover:bg-primary/10">
                                <Avatar className="h-24 w-24 mb-4">
                                    <AvatarImage src={artist.photoURL} />
                                    <AvatarFallback>{artist.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-bold text-white truncate w-full">{artist.displayName}</h3>
                                <p className="text-xs text-stone-400">@{artist.slug}</p>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
