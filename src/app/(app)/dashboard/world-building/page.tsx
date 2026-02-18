'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Map, Sparkles, Film, Palette, BookOpen, Layers, Zap, Landmark, ScrollText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function WorldBuildingPage() {
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
            Bâtissez des univers cohérents et immersifs. Utilisez nos modèles de structure et puisez votre inspiration dans les chefs-d'œuvre du patrimoine visuel africain.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/creations">Retour à l'Atelier</Link>
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3 mb-8">
          <TabsTrigger value="templates" className="gap-2">
            <Layers className="h-4 w-4" /> Modèles
          </TabsTrigger>
          <TabsTrigger value="inspiration" className="gap-2">
            <Film className="h-4 w-4" /> Inspiration Ciné
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <Palette className="h-4 w-4" /> Bibliothèque
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all duration-300">
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

        <TabsContent value="inspiration" className="space-y-8 animate-in fade-in-50 duration-500">
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
        </TabsContent>

        <TabsContent value="assets" className="animate-in fade-in-50 duration-500">
          <Card className="p-12 text-center border-dashed">
            <div className="mx-auto bg-primary/10 rounded-full p-6 w-fit mb-6">
              <Palette className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="mb-2">Bibliothèque d'Assets Visuels</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Retrouvez bientôt une collection de palettes de couleurs inspirées du Sahel, des savanes et des métropoles africaines, ainsi qu'une banque de motifs géométriques.
            </CardDescription>
            <Button className="mt-8" disabled>En cours de développement</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
