import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export default function FaqPage() {

    const faqsPourLecteurs = [
        {
            question: "Comment puis-je soutenir mes artistes préférés ?",
            reponse: "Vous pouvez soutenir les artistes de plusieurs manières : en vous abonnant à leurs œuvres, en aimant leurs chapitres, en laissant des commentaires constructifs, et en faisant des dons directement sur leur profil. Pour les œuvres 'Pro', l'achat d'AfriCoins pour débloquer du contenu premium est aussi un excellent moyen de les soutenir financièrement."
        },
        {
            question: "Qu'est-ce que les AfriCoins et comment les utiliser ?",
            reponse: "Les AfriCoins sont la monnaie virtuelle de NexusHub. Vous pouvez les acheter dans vos paramètres de compte. Ils vous permettent de débloquer des chapitres ou des œuvres 'Premium' pour accéder à du contenu exclusif."
        },
        {
            question: "Quelle est la différence entre le mode Webtoon et le mode BD ?",
            reponse: "Le mode Webtoon propose une lecture en défilement vertical, optimisée pour les smartphones. Le mode BD offre une expérience de lecture paginée classique, idéale pour les tablettes et les ordinateurs, simulant une vraie bande dessinée."
        }
    ];

    const faqsPourArtistes = [
        {
            question: "Quelle est la différence entre NexusHub Draft et NexusHub Pro ?",
            reponse: "NexusHub Draft est un espace gratuit pour tous les créateurs qui souhaitent partager leurs œuvres, obtenir des retours et construire une communauté. NexusHub Pro est un programme sélectif pour les œuvres abouties, offrant des opportunités de monétisation, une visibilité accrue et un accompagnement de notre équipe."
        },
        {
            question: "Comment puis-je passer de Draft à Pro ?",
            reponse: "Notre équipe éditoriale surveille régulièrement les œuvres publiées sur NexusHub Draft. Les œuvres qui montrent un grand potentiel en termes de qualité, d'originalité et d'engagement de la communauté peuvent être invitées à rejoindre le programme Pro. Pour le moment, les candidatures directes ne sont pas ouvertes, mais nous vous encourageons à peaufiner votre travail sur Draft !"
        },
        {
            question: "Comment fonctionne la monétisation sur NexusHub Pro ?",
            reponse: "Les artistes Pro peuvent monétiser leur travail de plusieurs manières : en rendant leurs œuvres 'Premium' (accessibles via les AfriCoins), en recevant des dons de la part des lecteurs, et via un partage des revenus publicitaires (à venir)."
        }
    ];


  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-16">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-5xl font-bold font-display mb-4">Foire Aux Questions</h1>
            <p className="text-lg text-muted-foreground">
                Trouvez les réponses aux questions les plus fréquemment posées.
            </p>
        </div>

        <div className="space-y-12">
            <div>
                <h2 className="text-3xl font-bold font-display mb-6 border-b pb-4">Pour les Lecteurs</h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqsPourLecteurs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                {faq.reponse}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

             <div>
                <h2 className="text-3xl font-bold font-display mb-6 border-b pb-4">Pour les Artistes</h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqsPourArtistes.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                                {faq.reponse}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    </div>
  );
}
