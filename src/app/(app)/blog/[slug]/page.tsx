'use client';

import { use } from 'react';
import { blogPosts } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Share2, MessageSquare, Tag } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = use(props.params);
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <Image
          src={post.coverImage.imageUrl}
          alt={post.title}
          fill
          className="object-cover"
          priority
          data-ai-hint={post.coverImage.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto max-w-4xl px-4 pb-12">
            <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Retour au blog
            </Link>
            <Badge className="bg-primary text-white mb-4 shadow-xl">{post.category}</Badge>
            <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">{post.author}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Expert NexusHub</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(post.date).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,200px] gap-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead text-2xl font-serif italic text-muted-foreground border-l-4 border-primary pl-6 mb-12">
              {post.excerpt}
            </p>
            
            <p>
              Dans le cadre du développement de la narration visuelle sur le continent, notamment pour les <strong>histoires africaines au Gabon</strong> et dans toute l'Afrique centrale, la question du world building est centrale. Comment marier les mythes ancestraux aux technologies de demain ?
            </p>

            <h2>La force de la mythologie locale</h2>
            <p>
              Le <strong>world building basé sur la mythologie</strong> n'est pas seulement une question esthétique. C'est une manière de réclamer notre héritage. Par exemple, intégrer les structures des cités-états historiques permet de créer des univers cyberpunk bien plus riches que les simples copies de décors occidentaux.
            </p>

            <blockquote>
              "L'afrofuturisme n'est pas de la science-fiction sur l'Afrique, c'est de l'Afrique qui crée le futur."
            </blockquote>

            <h2>Inspiration Cinématographique</h2>
            <p>
              Comme nous l'avons exploré dans nos outils pour artistes, des films comme <em>Black Panther</em> ou les œuvres de <em>Mati Diop</em> offrent des clés essentielles sur la gestion de la lumière et du symbolisme. Pour un auteur de webtoon, s'inspirer de ces cadres permet de gagner en profondeur émotionnelle.
            </p>

            <div className="bg-muted/30 p-8 rounded-2xl border border-border/50 my-12">
              <h3 className="flex items-center gap-2 mt-0"><Tag className="h-5 w-5 text-primary" /> Note de la rédaction</h3>
              <p className="text-sm mb-0">
                Cet article fait partie de notre série "NexusHub World Building". Notre mission est de fournir aux créateurs Draft et Pro les outils pour que leurs œuvres rayonnent mondialement tout en restant authentiques.
              </p>
            </div>
          </div>

          <aside className="space-y-12">
            <div className="sticky top-24 space-y-8">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Partager</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full"><Share2 className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full"><MessageSquare className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mots-clés</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
