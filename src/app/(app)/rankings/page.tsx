import { stories } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Eye, Heart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RankingsPage() {
  const popular = [...stories].sort((a, b) => b.views - a.views);
  const trending = [...stories].sort((a, b) => b.likes - a.likes);
  const newest = [...stories].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Crown className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold">Classements et Tendances</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-8">Découvrez les œuvres qui captivent notre communauté.</p>

      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="popular">Populaires</TabsTrigger>
          <TabsTrigger value="trending">Tendance</TabsTrigger>
          <TabsTrigger value="newest">Nouveautés</TabsTrigger>
        </TabsList>
        <TabsContent value="popular">
          <RankingList stories={popular} metric="views" />
        </TabsContent>
        <TabsContent value="trending">
          <RankingList stories={trending} metric="likes" />
        </TabsContent>
        <TabsContent value="newest">
          <RankingList stories={newest} metric="updatedAt" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface RankingListProps {
  stories: typeof stories;
  metric: 'views' | 'likes' | 'updatedAt';
}

function RankingList({ stories, metric }: RankingListProps) {
  return (
    <div className="grid gap-4 mt-6">
      {stories.map((story, index) => (
        <Card key={story.id} className="hover:bg-card/90 transition-colors">
          <CardContent className="p-4 flex items-start gap-4">
            <div className="text-3xl font-bold text-primary w-12 text-center shrink-0">#{index + 1}</div>
            <Link href={`/read/${story.id}`} className="shrink-0">
              <Image
                src={story.coverImage.imageUrl}
                alt={story.title}
                width={80}
                height={120}
                className="rounded-md object-cover aspect-[2/3]"
                data-ai-hint={story.coverImage.imageHint}
              />
            </Link>
            <div className="flex-grow">
              <Link href={`/read/${story.id}`}>
                <h3 className="text-xl font-headline font-semibold hover:text-primary transition-colors">{story.title}</h3>
              </Link>
              <Link href={`/artists/${story.artistId}`}>
                <p className="text-sm text-muted-foreground hover:text-accent transition-colors">par {story.artistName}</p>
              </Link>
              <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{story.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                 <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{(story.views / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{(story.likes / 1000).toFixed(0)}k</span>
                </div>
                 <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{(story.subscriptions / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>
            <div className="self-center">
              <Badge variant="secondary">{story.genre}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
