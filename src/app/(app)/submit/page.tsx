import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, PenSquare } from 'lucide-react';

export default function SubmitPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-display mb-4">Partagez Votre Talent</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          NexusHub est votre scène. Que vous soyez un artiste établi ou un créateur émergent, nous avons l'espace parfait pour votre histoire.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="flex flex-col border-primary/50 border-2 shadow-lg">
          <CardHeader className="text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Espace Pro</CardTitle>
            <CardDescription>Pour les artistes et œuvres aboutis</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-center text-muted-foreground mb-6">
              Rejoignez notre sélection d'artistes certifiés et donnez à vos œuvres la visibilité qu'elles méritent. L'Espace Pro est conçu pour les créateurs qui cherchent à professionnaliser leur art et à atteindre un public plus large.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-foreground/80">
                <li><strong>Visibilité Premium :</strong> Mise en avant sur la page d'accueil et dans nos collections.</li>
                <li><strong>Monétisation :</strong> Accès aux abonnements payants, dons, et plus encore.</li>
                <li><strong>Accompagnement :</strong> Conseils éditoriaux et support marketing de notre équipe.</li>
                <li><strong>Profil Vérifié :</strong> Un badge de certification pour asseoir votre crédibilité.</li>
            </ul>
          </CardContent>
          <div className="p-6 pt-0">
            <Button className="w-full" size="lg" disabled>Candidater à l'Espace Pro (bientôt)</Button>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="text-center">
            <PenSquare className="w-12 h-12 text-accent mx-auto mb-4" />
            <CardTitle className="text-2xl">Espace Draft</CardTitle>
            <CardDescription>Le laboratoire de la créativité</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-center text-muted-foreground mb-6">
                Lancez-vous sans attendre ! L'Espace Draft est un terrain de jeu ouvert à tous pour partager des projets en cours, des idées nouvelles et recevoir des retours instantanés de la part d'une communauté passionnée.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-foreground/80">
                <li><strong>Publication Libre :</strong> Mettez en ligne vos chapitres et illustrations sans validation.</li>
                <li><strong>Interaction Directe :</strong> Échangez avec vos lecteurs et construisez votre audience.</li>
                <li><strong>Flexibilité Totale :</strong> Idéal pour les webtoons, les strips, et les expérimentations.</li>
                <li><strong>Détection de Talents :</strong> Les œuvres populaires peuvent être repérées pour l'Espace Pro.</li>
            </ul>
          </CardContent>
           <div className="p-6 pt-0">
            <Button className="w-full" size="lg" variant="secondary">Publier dans l'Espace Draft</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
