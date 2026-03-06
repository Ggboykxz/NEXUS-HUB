import { getAdminServices } from '@/lib/firebase-admin';
import { StoryCard } from '@/components/story-card';
import { Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Story } from '@/lib/types';
import type { Metadata } from 'next';
import { GENRES } from '@/lib/genres'; // Importer la liste des genres

export const revalidate = 3600; // 1 hour

interface PageProps {
  params: { slug: string };
}

// Générer les métadonnées dynamiques pour un meilleur SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const genre = GENRES.find(g => g.slug === slug);
  const genreName = genre ? genre.name : 'Genre inconnu';

  if (!genre) {
    return { title: 'Genre introuvable' };
  }

  return {
    title: `Séries du genre ${genreName}`,
    description: `Explorez toutes nos œuvres exclusives du genre ${genreName} sur NexusHub.`,
  };
}

async function getStoriesByGenre(slug: string) {
  const { adminDb } = getAdminServices();
  const snap = await adminDb.collection('stories')
    .where('genreSlug', '==', slug)
    .where('isPublished', '==', true)
    .orderBy('rating', 'desc') // Trier par note pour mettre en avant le meilleur contenu
    .orderBy('views', 'desc')
    .limit(50)
    .get();
  
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
}

export default async function GenrePage({ params }: PageProps) {
  const { slug } = params;
  const genre = GENRES.find(g => g.slug === slug);

  // Si le slug ne correspond à aucun genre connu, renvoyer une erreur 404
  if (!genre) {
    notFound();
  }

  const genreStories = await getStoriesByGenre(slug);

  // Même si le genre existe, il se peut qu'aucune histoire ne soit encore publiée dedans.
  // Dans ce cas, nous affichons la page avec un message, plutôt qu'un 404.
  const genreName = genre.name;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
                <p className="text-sm font-bold text-primary uppercase tracking-widest">Genre</p>
                <h1 className="text-4xl font-bold font-display text-white">{genreName}</h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            Explorez toutes les œuvres exclusives de NexusHub classées dans la catégorie {genreName}.
          </p>
        </div>
      </header>

      {genreStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {genreStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-stone-400 font-bold text-xl mb-2">Aucune œuvre trouvée</p>
            <p className="text-stone-500 italic font-light">Il n'y a pas encore d'histoire dans le genre \"{genreName}\".<br/>Revenez plus tard !</p>
        </div>
      )}
    </div>
  );
}
