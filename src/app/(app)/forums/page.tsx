import { forumThreads, artists } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ForumsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <MessageSquare className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold font-display">Forums Communautaires</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Échangez, partagez vos conseils et collaborez avec la communauté.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau Sujet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discussions Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Sujet</TableHead>
                <TableHead className="text-center">Réponses</TableHead>
                <TableHead className="text-center">Vues</TableHead>
                <TableHead>Dernier Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forumThreads.map((thread) => {
                const authorIsArtist = artists.find(a => a.name === thread.author);
                const lastPostAuthorIsArtist = artists.find(a => a.name === thread.lastPost.author);
                
                return (
                  <TableRow key={thread.id}>
                    <TableCell>
                      <Link href={`/forums/${thread.id}`} className="font-semibold hover:text-primary transition-colors">
                        {thread.title}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        par
                        {authorIsArtist ? (
                          <Link href={`/artists/${authorIsArtist.id}`} className="font-semibold hover:text-primary transition-colors">{thread.author}</Link>
                        ) : (
                          <span className="font-semibold">{thread.author}</span>
                        )}
                        {authorIsArtist ? <Badge variant="secondary">Artiste</Badge> : <Badge variant="outline">Lecteur</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{thread.replies}</TableCell>
                    <TableCell className="text-center">{thread.views}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {lastPostAuthorIsArtist ? (
                          <Link href={`/artists/${lastPostAuthorIsArtist.id}`} className="font-semibold hover:text-primary transition-colors">{thread.lastPost.author}</Link>
                        ) : (
                          <span className="font-semibold">{thread.lastPost.author}</span>
                        )}
                         {lastPostAuthorIsArtist ? <Badge variant="secondary">Artiste</Badge> : <Badge variant="outline">Lecteur</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{thread.lastPost.time}</p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
