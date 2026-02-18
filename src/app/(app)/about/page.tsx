import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, Target, Users, Languages, Accessibility, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
    const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

    const values = [
        {
            icon: Heart,
            title: 'Passion',
            description: 'Nous sommes animés par l\'amour de la narration et de l\'art visuel africain.',
        },
        {
            icon: Users,
            title: 'Communauté',
            description: 'Un espace inclusif pour tous les créateurs et lecteurs du continent et d\'ailleurs.',
        },
        {
            icon: Target,
            title: 'Opportunité',
            description: 'Créer des débouchés économiques réels pour les artistes via les AfriCoins et la crypto.',
        },
    ];

    const commitments = [
        {
            icon: Languages,
            title: 'Fierté Linguistique',
            description: 'Support complet du Français, Anglais, Swahili, Wolof, Yoruba et plus encore. Nous croyons que chaque langue porte une part de notre héritage.',
        },
        {
            icon: Accessibility,
            title: 'Créativité Sans Barrières',
            description: 'Des outils adaptés pour les artistes en situation de handicap, incluant le dictage vocal pour les scénaristes et des interfaces optimisées.',
        },
        {
            icon: ShieldCheck,
            title: 'Économie Sécurisée',
            description: 'Une monnaie virtuelle protégée, avec des options de conversion Bitcoin/CFA via Binance Afrique pour une liberté financière totale.',
        },
    ];

    return (
        <div>
            <section className="relative py-24 bg-primary/5">
                <div className="container mx-auto max-w-7xl px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold font-display text-foreground mb-6">
                        À Propos de NexusHub
                    </h1>
                    <p className="text-xl text-foreground/80 max-w-3xl mx-auto italic">
                        La plateforme de la narration visuelle africaine. Un pont entre les créateurs et leur public mondial, sans barrières de langue ou de capacité.
                    </p>
                </div>
            </section>

            <section className="py-24">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                             <h2 className="text-4xl font-bold font-display mb-6">Notre Engagement</h2>
                             <div className="space-y-8">
                                {commitments.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="bg-primary/10 p-3 rounded-xl h-fit">
                                            <item.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/10">
                            {heroImage && (
                                <Image
                                    src={heroImage.imageUrl}
                                    alt="Vision Afro-futuriste"
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
                        <h2 className="text-4xl font-bold font-display mb-4">Nos Valeurs Fondamentales</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Ce qui nous guide chaque jour dans la construction de l'avenir du 9ème art africain.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <Card key={index} className="text-center p-8 hover:border-primary/50 transition-colors border-2">
                                <div className="mx-auto bg-primary/10 rounded-full p-5 w-fit mb-6">
                                    <value.icon className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-2xl mb-3">{value.title}</CardTitle>
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
