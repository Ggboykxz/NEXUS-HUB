import { getCurrentUser } from '@/lib/auth-service';
import { db } from '@/lib/firebase-admin';
import type { Story, UserProfile } from '@/lib/types';
import ProfileClient from './profile-client';
import { redirect } from 'next/navigation';

async function getUserData(userId: string) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return null; // Should not happen for a logged-in user
    }
    const user = { uid: userDoc.id, ...userDoc.data() } as UserProfile;

    const storiesRef = db.collection('stories');
    const creationsSnapshot = await storiesRef.where('artistId', '==', userId).orderBy('updatedAt', 'desc').get();
    const creations = creationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[];

    return { user, creations };
}

export default async function ProfileMePage() {
    const self = await getCurrentUser();

    if (!self) {
        // This page is protected, redirect to login if not authenticated
        redirect('/auth?callbackUrl=/profile/me');
    }

    const data = await getUserData(self.uid);

    if (!data) {
        // This case would be unusual, but handle it.
        return <p>Impossible de charger les données de l'utilisateur.</p>;
    }

    return <ProfileClient user={data.user} creations={data.creations} />;
}
