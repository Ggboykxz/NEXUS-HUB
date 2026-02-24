import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { StoryCard } from '@/components/story-card';
import { Layers } from 'lucide-react';
import type { Story } from '@/lib/types';
import HeaderFooterWrapper from '@/components/common/header-footer-wrapper';

export const revalidate = 3600;

export default async function WebtoonHubPage() {
  const q = query(
    collection(db, 'stories'), 
    where('format', 'in', ['Webtoon', 'Roman Illustré']),
    where('isPublished', '==', true),
    where('isBanned', '==', false),
    orderBy('updatedAt', 'desc')
  );
  
  const snap = await getDocs(q);
  const webtoons = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));

  return (
    <HeaderFooterWrapper>
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary/10 p-3 rounded-full">
              <Layers className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold font-display">Univers Webtoons</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-12 italic">
          Découvrez nos œuvres optimisées pour la lecture verticale. Un format moderne pour une immersion totale dans les cultures africaines.
        </p>

        {webtoons.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
            {webtoons.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border rounded-xl bg-card/50">
              <p className="text-muted-foreground italic">Aucun webtoon n'est disponible pour le moment.</p>
          </div>
        )}
      </div>
    </HeaderFooterWrapper>
  );
}
