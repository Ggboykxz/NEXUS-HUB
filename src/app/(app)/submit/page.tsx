import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, PenSquare } from 'lucide-react';

export default function SubmitPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-display mb-4">Publier votre œuvre</h1>
        <p className="text-lg text-muted-foreground">
          NexusHub offre deux espaces pour partager votre talent avec le monde.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <CardHeader className="text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Espace Pro</CardTitle>
            <CardDescription>Pour les artistes certifiés</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-center text-muted-foreground mb-6">
              Bénéficiez d'une mise en avant sur la plateforme, d'un accompagnement éditorial et d'opportunités de monétisation exclusives.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Visibilité accrue sur la page d'accueil</li>
                <li>Accès aux fonctionnalités de monétisation (Abonnements, etc.)</li>
                <li>Profil Artiste Vérifié</li>
                <li>Accompagnement par notre équipe</li>
            </ul>
          </CardContent>
          <div className="p-6 pt-0">
            <Button className="w-full" disabled>Candidater (bientôt)</Button>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="text-center">
            <PenSquare className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Espace Draft</CardTitle>
            <CardDescription>Publication libre pour tous</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-center text-muted-foreground mb-6">
                Partagez vos créations, expérimentez de nouvelles idées et recevez des retours constructifs de la part de la communauté.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Publication instantanée de vos chapitres</li>
                <li>Interaction directe avec les lecteurs</li>
                <li>Aucun processus de sélection</li>
                <li>Idéal pour les projets en cours et les nouvelles séries</li>
            </ul>
          </CardContent>
           <div className="p-6 pt-0">
            <Button className="w-full">Soumettre une œuvre</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
