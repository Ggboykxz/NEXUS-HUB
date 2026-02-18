import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Coins, Languages, Accessibility, ShieldCheck } from 'lucide-react';

export default function FaqPage() {

    const faqsPourLecteurs = [
        {
            question: "Comment puis-je soutenir mes artistes préférés ?",
            reponse: "Vous pouvez les soutenir en vous abonnant à leurs œuvres, en laissant des commentaires et en faisant des dons. L'achat d'AfriCoins permet aussi de débloquer du contenu exclusif."
        },
        {
            question: "Qu'est-ce que les AfriCoins et comment les acheter en crypto ?",
            reponse: "Les AfriCoins sont la monnaie virtuelle de NexusHub. Vous pouvez les acheter par carte bancaire ou via Bitcoin/CFA en utilisant notre passerelle Binance Afrique sécurisée dans vos paramètres."
        },
        {
            question: "Y a-t-il une limite sur l'achat d'AfriCoins ?",
            reponse: "Oui, pour prévenir les abus et les transactions frauduleuses, un 'cooldown' de 15 minutes est appliqué après chaque achat massif de packs premium."
        }
    ];

    const faqsTechniques = [
        {
            question: "Quelles langues sont supportées sur la plateforme ?",
            reponse: "NexusHub supporte le Français, l'Anglais, le Swahili, le Wolof et le Yoruba. Nous travaillons activement à l'ajout de nouvelles langues régionales pour une accessibilité totale."
        },
        {
            question: "Quels outils sont disponibles pour les artistes handicapés ?",
            reponse: "Nous proposons des outils de 'Voice-to-Text' pour la rédaction de scénarios et des interfaces adaptées aux lecteurs d'écran, permettant à chacun de partager sa vision sans barrières physiques."
        },
        {
            question: "Comment fonctionne la conversion CFA / Crypto ?",
            reponse: "Grâce à notre partenariat avec des passerelles régionales, vous pouvez convertir vos cryptos en CFA pour recharger votre solde AfriCoins instantanément, au taux du marché réel."
        }
    ];


  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-16">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-5xl font-bold font-display mb-4">Foire Aux Questions</h1>
            <p className="text-lg text-muted-foreground">
                Inclusion, Technologie et Créativité. Tout savoir sur NexusHub.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/10 p-2 rounded-lg"><Coins className="text-primary h-5 w-5" /></div>
                    <h3 className="font-bold">Économie Crypto</h3>
                </div>
                <p className="text-sm text-muted-foreground">Paiements sécurisés via Bitcoin et Binance Afrique pour une liberté financière totale sur le continent.</p>
            </div>
            <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500/10 p-2 rounded-lg"><Languages className="text-emerald-500 h-5 w-5" /></div>
                    <h3 className="font-bold">Support Multilingue</h3>
                </div>
                <p className="text-sm text-muted-foreground">Lisez et écrivez dans votre langue maternelle : Swahili, Wolof, Yoruba et bien d'autres.</p>
            </div>
        </div>

        <div className="space-y-12">
            <div>
                <h2 className="text-3xl font-bold font-display mb-6 border-b pb-4 flex items-center gap-3">
                    <Accessibility className="h-6 w-6 text-primary" /> Questions Générales
                </h2>
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
                <h2 className="text-3xl font-bold font-display mb-6 border-b pb-4 flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" /> Technique & Accessibilité
                </h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqsTechniques.map((faq, index) => (
                        <AccordionItem key={index} value={`tech-${index}`}>
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
