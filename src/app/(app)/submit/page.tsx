import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, PenSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SubmitPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold font-display mb-4">De Draft à Pro : Votre Parcours sur NexusHub</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Découvrez les deux voies pour partager votre talent sur NexusHub. Commencez en tant qu'artiste Draft pour bâtir votre audience, et visez le statut Pro pour monétiser votre art.
        </p>
      </div>

      <div className="relative">
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-8">
            {/* NexusHub Draft Card */}
            <Card className="flex flex-col md:w-1/2">
              <CardHeader className="text-center">
                <PenSquare className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle className="text-2xl">NexusHub Draft</CardTitle>
                <CardDescription>Le point de départ pour chaque créateur</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-center text-muted-foreground mb-6">
                    Que vous soyez un artiste émergent ou confirmé, Draft est votre espace pour expérimenter, publier sans contrainte et bâtir une communauté.
                </p>
                <ul className="list-disc list-inside space-y-3 text-sm text-foreground/80">
                    <li><strong>Publication ouverte à tous :</strong> Aucune sélection à l'entrée. Partagez vos œuvres et idées dès aujourd'hui.</li>
                    <li><strong>Laboratoire créatif :</strong> Idéal pour les projets en cours, les formats courts et les expérimentations.</li>
                    <li><strong>Accès à la communauté :</strong> Recevez des retours, des commentaires et commencez à construire votre base de fans.</li>
                    <li><strong>Le tremplin vers Pro :</strong> Les œuvres qui se distinguent par leur qualité et leur engagement peuvent être invitées à passer Pro.</li>
                </ul>
              </CardContent>
               <div className="p-6 pt-0">
                <Button asChild className="w-full" size="lg" variant="secondary">
                  <Link href="/dashboard/creations">
                    <PenSquare className="mr-2"/>
                    Publier sur Draft
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Arrow for progression */}
            <div className="hidden md:flex items-center justify-center rotate-90 md:rotate-0">
                <ArrowRight className="w-10 h-10 text-primary animate-pulse" />
            </div>

             {/* NexusHub Pro Card */}
            <Card className="flex flex-col md:w-1/2 border-primary/50 border-2 shadow-lg">
              <CardHeader className="text-center">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">NexusHub Pro</CardTitle>
                <CardDescription>L'élite des créateurs certifiés</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-center text-muted-foreground mb-6">
                  Un programme sur invitation pour les œuvres qui ont démontré une qualité exceptionnelle, un engagement fort et un potentiel professionnel.
                </p>
                <ul className="list-disc list-inside space-y-3 text-sm text-foreground/80">
                    <li><strong>Monétisation avancée :</strong> Gagnez des revenus via les chapitres Premium (AfriCoins), les dons directs et le futur partage des revenus publicitaires.</li>
                    <li><strong>Visibilité maximale :</strong> Soyez mis en avant sur la page d'accueil, dans les classements et nos sélections éditoriales.</li>
                    <li><strong>Badge Pro & Crédibilité :</strong> Obtenez le badge "Pro" sur votre profil, un gage de qualité et de confiance pour les lecteurs et les éditeurs.</li>
                    <li><strong>Accès au Mentorat :</strong> Partagez votre savoir-faire et guidez la nouvelle génération en devenant un mentor officiel.</li>
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full" size="lg" disabled>Sur Invitation Uniquement</Button>
              </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
