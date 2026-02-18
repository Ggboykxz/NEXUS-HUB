import { artists } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Users, Award, PenSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ArtistsPage() {
  const proArtists = artists.filter(a => a.isMentor);
  const draftArtists = artists.filter(a => !a.isMentor);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Users className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold font-display">Nos Artistes</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-12">
        Découvrez les esprits créatifs de NexusHub. Des maîtres certifiés du programme Pro aux nouveaux talents prometteurs de l'espace Draft.
      </p>

      {/* Pro Section */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
            <Award className="text-emerald-500 h-6 w-6" />
            <h2 className="text-2xl font-bold font-display tracking-tight">NexusHub Pro</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {proArtists.map((artist) => (
            <Link key={artist.id} href={`/artiste/${artist.slug}`} className="block h-full group">
                <Card className="text-center p-4 transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col border-emerald-500/20 bg-emerald-500/[0.02]">
                <CardContent className="p-0 flex flex-col items-center flex-grow justify-center">
                    <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-emerald-500/50 mb-4 transition-all group-hover:ring-emerald-500">
                    <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} data-ai-hint={artist.avatar.imageHint} />
                    <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-lg font-display font-semibold group-hover:text-emerald-500 transition-colors">{artist.name}</h3>
                        <Badge variant="default" className="gap-1 text-[10px] bg-emerald-500 hover:bg-emerald-600 border-none uppercase tracking-widest px-2 py-0.5">
                            <Award className="h-3 w-3" />
                            Pro
                        </Badge>
                    </div>
                </CardContent>
                </Card>
            </Link>
            ))}
        </div>
      </section>

      {/* Draft Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
            <PenSquare className="text-orange-400 h-6 w-6" />
            <h2 className="text-2xl font-bold font-display tracking-tight">NexusHub Draft</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-orange-400/20 to-transparent" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {draftArtists.map((artist) => (
            <Link key={artist.id} href={`/artiste/${artist.slug}`} className="block h-full group">
                <Card className="text-center p-4 transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col bg-muted/30 border-dashed">
                <CardContent className="p-0 flex flex-col items-center flex-grow justify-center">
                    <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-orange-400/30 mb-4 transition-all group-hover:ring-orange-400/60">
                    <AvatarImage src={artist.avatar.imageUrl} alt={artist.name} data-ai-hint={artist.avatar.imageHint} />
                    <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-lg font-display font-semibold group-hover:text-orange-400 transition-colors">{artist.name}</h3>
                        <Badge variant="outline" className="gap-1 text-[10px] border-orange-400/50 text-orange-400 uppercase tracking-widest px-2 py-0.5">
                            <PenSquare className="h-3 w-3" />
                            Draft
                        </Badge>
                    </div>
                </CardContent>
                </Card>
            </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
