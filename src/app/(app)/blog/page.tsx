
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, Calendar, User, ArrowRight, Search, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import type { BlogPost } from '@/lib/types';

/**
 * Page du Blog convertie en Client Component.
 */
export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(
          collection(db, 'blogPosts'),
          where('status', '==', 'publié'),
          orderBy('publishedAt', 'desc'),
          limit(12)
        );
        const snap = await getDocs(q);
        setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Consultation des manuscrits...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Newspaper className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight">Blog & Ressources</h1>
          </div>
          <p className="text-lg text-stone-400 max-w-2xl italic font-light leading-relaxed">
            Conseils de world building, analyses culturelles et coulisses de la création panafricaine.
          </p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Rechercher un article..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-2xl bg-white/5 border-white/5 text-sm font-medium focus:border-primary transition-all" 
          />
        </div>
      </header>

      <main>
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => {
              const date = post.publishedAt && (post.publishedAt as any).toDate 
                ? (post.publishedAt as any).toDate() 
                : new Date(post.publishedAt as string);

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                  <Card className="flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-2xl border-white/5 bg-white/5 hover:border-primary/20">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={post.coverImage.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      <Badge className="absolute top-4 left-4 bg-primary text-black border-none shadow-lg font-black uppercase text-[9px] px-3">
                        {post.category}
                      </Badge>
                    </div>
                    <CardHeader className="p-8">
                      <div className="flex items-center gap-4 text-[9px] uppercase font-black text-stone-500 mb-4 tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {post.authorName}</span>
                      </div>
                      <CardTitle className="text-2xl font-bold font-display leading-tight group-hover:text-primary transition-colors mb-4 text-white">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-3 leading-relaxed italic text-stone-400 font-light">
                        "{post.excerpt}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 mt-auto flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] uppercase font-black tracking-[0.2em] text-primary/60">#{tag}</span>
                        ))}
                      </div>
                      <Button variant="ghost" className="p-0 h-auto text-primary font-black group-hover:gap-2 transition-all text-[9px] uppercase tracking-widest">
                        Lire l'article <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-4">
            <Newspaper className="h-12 w-12 text-stone-700 mx-auto opacity-20" />
            <p className="text-stone-500 italic font-light">Aucun article n'a encore été publié ou ne correspond à votre recherche.</p>
          </div>
        )}
      </main>
    </div>
  );
}
