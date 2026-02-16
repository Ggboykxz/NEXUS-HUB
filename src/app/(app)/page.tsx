import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/story-card';
import { stories } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  const popularStories = [...stories].sort((a, b) => b.views - a.views).slice(0, 4);
  const newStories = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4);
  const recommendedStories = [...stories].sort(() => 0.5 - Math.random()).slice(0, 5);

  return (
    <>
      <header className="relative pt-12 pb-24 overflow-hidden">
        <div className="container max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
              Plongez au Cœur des <br/>
              <span className="italic text-primary">Histoires Africaines</span>
            </h1>
            <p className="text-lg text-foreground/70 dark:text-stone-400 font-light max-w-2xl mx-auto mb-10">
              Découvrez un univers de bandes dessinées, webtoons et romans graphiques créés par des artistes africains talentueux.
            </p>
            <div className="flex gap-6 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-yellow-600 text-white font-medium px-8 py-3 rounded shadow-sm hover:shadow-md transition-all duration-300">
                <Link href="/stories">Commencer la lecture</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border border-foreground/20 hover:border-foreground text-foreground dark:text-stone-300 px-8 py-3 rounded transition-all duration-300">
                 <Link href="/submit">Soumettre une œuvre</Link>
              </Button>
            </div>
          </div>
          <div className="relative w-full aspect-[21/9] md:aspect-[2.5/1] rounded-xl overflow-hidden shadow-sm">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover object-top"
                priority
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent dark:from-background/80 h-1/3 bottom-0 top-auto"></div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-24">
        <StoryCarousel title="Œuvres Populaires" stories={popularStories} columns="4"/>
        <StoryCarousel title="Nouveautés" stories={newStories} columns="4"/>
        <StoryCarousel title="Recommandations" stories={recommendedStories} columns="5"/>
      </main>
    </>
  );
}

function StoryCarousel({ title, stories, columns }: { title: string; stories: (typeof import('@/lib/data').stories)[0][]; columns: "4" | "5" }) {
  const gridClasses = {
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12",
    "5": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12"
  };
  
  return (
    <section>
      <div className="flex justify-between items-baseline mb-12 border-b border-border pb-4">
        <h2 className="text-3xl font-display font-bold text-foreground">{title}</h2>
        <Link href="/stories" className="group flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors">
          Voir plus
          <ArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className={`grid ${gridClasses[columns]}`}>
          {stories.map((story) => (
             <StoryCard key={story.id} story={story} />
          ))}
      </div>
    </section>
  );
}
