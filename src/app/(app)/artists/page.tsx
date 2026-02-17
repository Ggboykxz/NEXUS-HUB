import { artists } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Users, Award, PenSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ArtistsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Users className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">Nos Artistes</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-8">
        Les esprits créatifs derrière vos histoires préférées. Découvrez également nos mentors qui guident la nouvelle génération de talents.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <Link key={artist.id} href={`/artists/${artist.id}`} className="block h-full">
            <Card className="text-center p-4 transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
              <CardContent className="p-0 flex flex-col items-center flex-grow justify-center">
                <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary mb-4">
                  <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} data-ai-hint={artist.avatar.imageHint} />
                  <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-center gap-2">
                    <h2 className="text-lg font-display font-semibold">{artist.name}</h2>
                    {artist.isMentor ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                        <Award className="h-3 w-3" />
                        Pro
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="gap-1 text-xs">
                        <PenSquare className="h-3 w-3" />
                        Draft
                        </Badge>
                    )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
