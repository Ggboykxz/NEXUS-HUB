
'use client';

import { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Share2, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/types';
import { notFound } from 'next/navigation';

/**
 * Page de détail d'un article convertie en Client Component.
 */
export default function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const q = query(
          collection(db, 'blogPosts'),
          where('slug', '==', params.slug),
          where('status', '==', 'publié'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPost({ id: snap.docs[0].id, ...snap.docs[0].data() } as BlogPost);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) notFound();

  const date = post.publishedAt && (post.publishedAt as any).toDate 
    ? (post.publishedAt as any).toDate() 
    : new Date(post.publishedAt as string);

  return (
    <article className="min-h-screen bg-stone-950 text-white animate-in fade-in duration-1000">
      <div className="relative h-[65vh] min-h-[450px] w-full overflow-hidden">
        <Image
          src={post.coverImage.imageUrl}
          alt={post.title}
          fill
          className="object-cover opacity-40 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto max-w-4xl px-6 pb-16">
            <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-black text-[10px] uppercase tracking-widest mb-8 transition-all bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <ArrowLeft className="h-4 w-4" /> Retour au blog
            </Link>
            <Badge className="bg-primary text-black mb-6 shadow-2xl uppercase font-black text-[10px] tracking-widest px-4">{post.category}</Badge>
            <h1 className="text-4xl md:text-7xl font-black font-display text-white leading-[0.9] tracking-tighter mb-8 gold-resplendant">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-2xl">
                  <AvatarFallback className="bg-stone-800 text-primary font-black uppercase text-sm">{post.authorName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-black text-white">{post.authorName}</p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black">Scribe de NexusHub</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-xl">
                <Calendar className="h-4 w-4 text-primary" />
                {date.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,240px] gap-16">
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-p:font-light prose-p:text-stone-300">
            <p className="lead text-2xl font-serif italic text-primary/80 border-l-4 border-primary/30 pl-8 mb-16 leading-relaxed">
              {post.excerpt}
            </p>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          <aside className="space-y-12">
            <div className="sticky top-24 space-y-10">
               <div className="flex flex-col gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Partager</p>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-white/10 hover:bg-white/5"><Share2 className="h-5 w-5 text-primary" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-white/10 hover:bg-white/5"><MessageSquare className="h-5 w-5 text-primary" /></Button>
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Mots-clés</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 text-stone-400 border-white/5 hover:text-primary transition-colors cursor-pointer">{tag}</Badge>
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
