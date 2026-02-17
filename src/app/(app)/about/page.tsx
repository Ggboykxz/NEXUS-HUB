import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, Target, Users } from 'lucide-react';

export default function AboutPage() {
    const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

    const values = [
        {
            icon: Heart,
            title: 'Passion',
            description: 'Nous sommes animés par l\'amour de la narration et de l\'art visuel, et nous voulons partager cette passion avec le monde.',
        },
        {
            icon: Users,
            title: 'Communauté',
            description: 'Nous croyons au pouvoir de la communauté pour soutenir, inspirer et élever les créateurs et les lecteurs.',
        },
        {
            icon: Target,
            title: 'Opportunité',
            description: 'Nous nous engageons à créer des opportunités économiques et de visibilité pour les artistes africains.',
        },
    ];

    return (
        <div>
            <section className="relative py-24 bg-primary/5">
                <div className="container mx-auto max-w-7xl px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold font-display text-foreground mb-6">
                        À Propos de NexusHub
                    </h1>
                    <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
                        La plateforme de la narration visuelle africaine. Un pont entre les créateurs et leur public mondial.
                    </p>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                             <h2 className="text-4xl font-bold font-display mb-6">Notre Mission</h2>
                             <div className="space-y-4 text-lg text-foreground/80 leading-relaxed">
                                <p>
                                    NexusHub est né d'une ambition simple mais puissante : créer une scène mondiale pour les créateurs de bandes dessinées, webtoons et romans graphiques du continent africain et de sa diaspora. Nous voulons briser les barrières géographiques et économiques qui limitent trop souvent la portée des talents exceptionnels.
                                </p>
                                <p>
                                    Notre mission est de devenir le carrefour où les histoires africaines rencontrent le monde. Nous offrons aux artistes les outils pour publier, monétiser et développer leur audience, tout en proposant aux lecteurs une bibliothèque riche et diversifiée d'œuvres qui célèbrent la créativité, la culture et l'imagination africaines.
                                </p>
                             </div>
                        </div>
                        <div className="aspect-square relative rounded-lg overflow-hidden shadow-lg">
                            {heroImage && (
                                <Image
                                    src={heroImage.imageUrl}
                                    alt="Image illustrative"
                                    fill
                                    className="object-cover"
                                    data-ai-hint={heroImage.imageHint}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="py-24 bg-background">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold font-display mb-4">Nos Valeurs</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Ce qui nous guide chaque jour dans la construction de NexusHub.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <Card key={index} className="text-center p-6">
                                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-6">
                                    <value.icon className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-2xl mb-2">{value.title}</CardTitle>
                                <CardContent className="p-0">
                                    <p className="text-muted-foreground">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
