import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, PenSquare, ArrowRight } from 'lucide-react';

export default function SubmitPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-display mb-4">De Draft à Pro : Votre Parcours sur NexusHub</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Commencez sur NexusHub Draft pour partager librement vos créations et construire votre audience. Les œuvres les plus prometteuses auront la chance de passer Pro, d'être monétisées et de toucher un public encore plus large.
        </p>
      </div>

      <div className="relative">
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-8">
            {/* NexusHub Draft Card */}
            <Card className="flex flex-col md:w-1/2">
              <CardHeader className="text-center">
                <PenSquare className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle className="text-2xl">NexusHub Draft</CardTitle>
                <CardDescription>Le laboratoire de la créativité</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-center text-muted-foreground mb-6">
                    Un espace d'apprentissage gratuit où vous pouvez recevoir des feedbacks bienveillants et voir votre progression.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-foreground/80">
                    <li><strong>Espace d'apprentissage :</strong> Partagez vos projets en cours et idées nouvelles.</li>
                    <li><strong>Feedback bienveillant :</strong> Échangez avec vos lecteurs et construisez votre audience.</li>
                    <li><strong>Progression visible :</strong> Les œuvres populaires peuvent être repérées pour évoluer vers NexusHub Pro.</li>
                </ul>
              </CardContent>
               <div className="p-6 pt-0">
                <Button className="w-full" size="lg" variant="secondary">Artiste amateur ? Publiez gratuitement !</Button>
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
                <CardDescription>Pour les artistes et œuvres aboutis</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-center text-muted-foreground mb-6">
                  Rejoignez notre sélection d'artistes certifiés pour une visibilité internationale et des opportunités de monétisation.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-foreground/80">
                    <li><strong>Validation qualité :</strong> Notre équipe vous accompagne pour peaufiner vos œuvres.</li>
                    <li><strong>Monétisation :</strong> Accès aux abonnements, dons, et partage de revenus.</li>
                    <li><strong>Visibilité internationale :</strong> Mise en avant sur la page d'accueil et dans nos collections.</li>
                    <li><strong>Badge certifié :</strong> Un badge de certification pour asseoir votre crédibilité.</li>
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full" size="lg" disabled>Candidater à NexusHub Pro (bientôt)</Button>
              </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
