import { db } from '@/lib/firebase-admin';
import type { UserProfile, Story } from '@/lib/types';
import ArtistDetailClient from './artist-detail-client';
import { notFound } from 'next/navigation';

async function getArtistAndStories(slug: string) {
    // Get artist data
    const usersRef = db.collection('users');
    const userQuery = usersRef.where('slug', '==', slug).limit(1);
    const userSnapshot = await userQuery.get();

    if (userSnapshot.empty) {
        return null;
    }

    const artistDoc = userSnapshot.docs[0];
    const artist = { uid: artistDoc.id, ...artistDoc.data() } as UserProfile;

    // Get published stories for the artist
    const storiesRef = db.collection('stories');
    const storiesQuery = storiesRef
        .where('artistId', '==', artist.uid)
        .where('isPublished', '==', true)
        .orderBy('updatedAt', 'desc');
    
    const storiesSnapshot = await storiesQuery.get();
    const stories = storiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[];

    return { artist, stories };
}

export default async function ArtistPage({ params }: { params: { slug: string } }) {
    const data = await getArtistAndStories(params.slug);

    if (!data) {
        notFound();
    }

    return <ArtistDetailClient artist={data.artist} artistStories={data.stories} />;
}
