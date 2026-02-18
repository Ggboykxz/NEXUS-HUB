'use client';

import { blogPosts } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, Calendar, User, ArrowRight, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function BlogListingPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Newspaper className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold font-display">Blog & Ressources</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Conseils de world building, analyses culturelles et coulisses de la création panafricaine.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un article..." className="pl-9 rounded-full bg-muted/50 border-none h-11" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
            <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-2xl border-none bg-muted/20">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={post.coverImage.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  data-ai-hint={post.coverImage.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <Badge className="absolute top-4 left-4 bg-primary text-white border-none shadow-lg">
                  {post.category}
                </Badge>
              </div>
              <CardHeader className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(post.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {post.author}</span>
                </div>
                <CardTitle className="text-xl font-bold font-display leading-tight group-hover:text-primary transition-colors mb-3">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 mt-auto">
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold tracking-widest text-primary/60">#{tag}</span>
                  ))}
                </div>
                <Button variant="link" className="p-0 h-auto text-primary font-bold group-hover:gap-2 transition-all">
                  Lire l'article <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* SEO Cross-post Preview Section */}
      <section className="mt-24 p-12 rounded-3xl bg-primary/5 border border-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-display mb-6">Explorez la narration visuelle africaine</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            De la création d'histoires africaines au Gabon aux méthodes de world building basées sur la mythologie, NexusHub est le point de rencontre entre tradition et innovation technologique.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary">#HistoiresAfricainesGabon</Badge>
            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary">#WorldBuildingMythologie</Badge>
            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 text-primary">#Afrofuturisme</Badge>
          </div>
        </div>
      </section>
    </div>
  );
}
