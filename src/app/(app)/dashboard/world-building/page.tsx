'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Map, Sparkles, Film, Palette, BookOpen, Layers, Zap, Landmark, ScrollText, Mic, Accessibility, MessageSquareQuote, Newspaper, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { blogPosts } from '@/lib/data';

export default function WorldBuildingPage() {
  const { toast } = useToast();

  const templates = [
    {
      title: "Géographie & Topographie",
      icon: Map,
      description: "Structures de cités-états côtières, royaumes désertiques ou citadelles de haute altitude.",
      tags: ["Climat", "Architecture", "Ressources"]
    },
    {
      title: "Systèmes de Magie",
      icon: Zap,
      description: "Inspirations basées sur les forces élémentaires, le culte des ancêtres ou les énergies cosmiques.",
      tags: ["Dogon", "Yoruba", "Mysticisme"]
    },
    {
      title: "Structures Sociales",
      icon: Landmark,
      description: "Lignages matrilinéaires, systèmes de castes, ou confédérations nomades.",
      tags: ["Politique", "Tradition", "Hiérarchie"]
    },
    {
      title: "Langues & Folklore",
      icon: ScrollText,
      description: "Outils pour créer des dialectes uniques et intégrer des proverbes et contes oraux.",
      tags: ["Linguistique", "Mythes", "Oralité"]
    }
  ];

  const cinemaInspirations = [
    {
      title: "L'Esthétique Futuriste",
      reference: "Black Panther (Ryan Coogler)",
      description: "Mélange de haute technologie et de textures traditionnelles (vibranium, motifs adinkra).",
      imageUrl: "https://images.unsplash.com/photo-1609804213568-19c806540d6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      imageHint: "afrofuturism high tech"
    },
    {
      title: "Le Mysticisme Onirique",
      reference: "Atlantique (Mati Diop)",
      description: "Utilisation de la lumière et du décor pour créer une ambiance fantastique et mélancolique.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      imageHint: "mystic ocean night"
    },
    {
      title: "L'Épopée Historique",
      reference: "La Noire de... (Ousmane Sembène)",
      description: "Force du cadre et symbolisme profond dans la narration visuelle.",
      imageUrl: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      imageHint: "historical african cinematography"
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Globe className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold font-display">Atelier de World Building</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Bâtissez des univers cohérents et immersifs. Utilisez nos modèles et nos nouveaux outils d'accessibilité vocale pour libérer votre créativité.
          </p>
        </div>
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href="/blog"><Newspaper className="mr-2 h-4 w-4" /> Voir le Blog</Link>
            </Button>
            <Button asChild variant="default">
                <Link href="/dashboard/creations">Retour à l'Atelier</Link>
            </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full md:w-[800px] grid-cols-4 mb-8">
          <TabsTrigger value="templates" className="gap-2">
            <Layers className="h-4 w-4" /> Modèles
          </TabsTrigger>
          <TabsTrigger value="inspiration" className="gap-2">
            <Film className="h-4 w-4" /> Inspiration Ciné
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="gap-2 text-emerald-500">
            <Accessibility className="h-4 w-4" /> Accessibilité
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <Palette className="h-4 w-4" /> Bibliothèque
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all duration-300 border-2">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <template.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{template.title}</CardTitle>
                    <CardDescription>Template de structure narrative</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 mb-6 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">{tag}</Badge>
                    ))}
                  </div>
                  <Button className="w-full" variant="outline">Utiliser ce modèle</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inspiration" className="space-y-12 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cinemaInspirations.map((item, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-xl bg-muted/30">
                <div className="relative aspect-video">
                  <Image 
                    src={item.imageUrl} 
                    alt={item.title} 
                    fill 
                    className="object-cover"
                    data-ai-hint={item.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-primary text-white border-none">{item.reference}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-display">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  <Button variant="link" className="px-0 mt-4 h-auto text-primary font-bold">
                    Explorer l'esthétique <Sparkles className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-primary" /> Lectures conseillées pour votre World Building
                </CardTitle>
                <CardDescription>Approfondissez vos connaissances avec nos articles de blog spécialisés.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blogPosts.slice(0, 2).map(post => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border/50 hover:border-primary/50 transition-all group">
                            <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0">
                                <Image src={post.coverImage.imageUrl} alt={post.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{post.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">Lire l'article <ArrowRight className="h-3 w-3" /></p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 border-emerald-500/20 bg-emerald-500/[0.02]">
                    <div className="bg-emerald-500/10 p-4 rounded-full w-fit mb-6">
                        <Mic className="h-10 w-10 text-emerald-500" />
                    </div>
                    <CardTitle className="text-2xl mb-4 text-emerald-500">Voice-to-Text pour Scénaristes</CardTitle>
                    <p className="text-muted-foreground leading-relaxed mb-8">
                        Un outil révolutionnaire permettant aux créateurs en situation de handicap (moteur ou visuel) de rédiger leurs scénarios, dialogues et descriptions d'univers par la voix. Support multilingue inclus.
                    </p>
                    <Button onClick={() => toast({title: "Microphone activé", description: "Prêt pour la dictée vocale..."})} className="w-full bg-emerald-500 hover:bg-emerald-600">
                        Lancer l'Assistant Vocal
                    </Button>
                </Card>

                <Card className="p-8 border-primary/20 bg-primary/[0.02]">
                    <div className="bg-primary/10 p-4 rounded-full w-fit mb-6">
                        <MessageSquareQuote className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-4 text-primary">Traduction Culturelle Assistée</CardTitle>
                    <p className="text-muted-foreground leading-relaxed mb-8">
                        Traduisez vos œuvres en Swahili, Wolof ou Yoruba tout en préservant les nuances culturelles et les expressions idiomatiques. Un pont entre les régions du continent.
                    </p>
                    <Button variant="outline" className="w-full border-primary text-primary">
                        Accéder au Traducteur
                    </Button>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="assets" className="animate-in fade-in-50 duration-500">
          <Card className="p-12 text-center border-dashed">
            <div className="mx-auto bg-primary/10 rounded-full p-6 w-fit mb-6">
              <Palette className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="mb-2">Bibliothèque d'Assets Visuels</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Retrouvez bientôt une collection de palettes de couleurs inspirées du Sahel et des savanes, ainsi qu'une banque de motifs géométriques.
            </CardDescription>
            <Button className="mt-8" disabled>En cours de développement</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
