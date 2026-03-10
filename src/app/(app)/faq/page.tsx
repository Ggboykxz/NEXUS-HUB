import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchableFaq } from '@/components/faq/searchable-faq';
import { ChevronRight, Languages, ShieldCheck } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: 'Lecture' | 'Création' | 'AfriCoins' | 'Compte' | 'Technique';
}

const FAQ_DATA: FaqItem[] = [
  {
    category: 'Lecture',
    question: "Comment puis-je lire hors-ligne ?",
    answer: "Grâce à notre support PWA, vous pouvez installer l'application sur votre mobile. Une fois un chapitre ouvert, il est mis en cache et reste accessible même sans connexion internet."
  },
  {
    category: 'Lecture',
    question: "Quelle est la différence entre le mode Webtoon et BD ?",
    answer: "Le mode Webtoon propose un défilement vertical infini optimisé pour mobile. Le mode BD utilise une pagination classique, idéale pour les albums et les tablettes en mode paysage."
  },
  {
    category: 'Création',
    question: "Comment devenir artiste Pro sur NexusHub ?",
    answer: "Le statut Pro est accordé aux artistes du programme Draft ayant atteint 5 000 vues cumulées et dont le travail a été validé par notre comité éditorial pour sa qualité narrative."
  },
  {
    category: 'Création',
    question: "Quels sont les formats d'image acceptés ?",
    answer: "Nous acceptons les formats JPG, PNG et WebP. Pour une lecture optimale, nous recommandons une largeur de 800px pour les Webtoons et un ratio 2:3 pour les couvertures."
  },
  {
    category: 'AfriCoins',
    question: "Qu'est-ce que les AfriCoins et comment les acheter ?",
    answer: "Les AfriCoins sont la monnaie virtuelle de NexusHub. Vous pouvez les acheter via Mobile Money (Airtel, Orange, Moov), carte bancaire ou cryptomonnaies pour débloquer du contenu Premium."
  },
  {
    category: 'AfriCoins',
    question: "Comment sont rémunérés les artistes ?",
    answer: "Les artistes Pro et Elite perçoivent jusqu'à 70% des revenus générés par les AfriCoins dépensés sur leurs œuvres, ainsi que l'intégralité des dons directs des lecteurs."
  },
  {
    category: 'Compte',
    question: "Comment changer mon pseudo ou ma photo de profil ?",
    answer: "Rendez-vous dans vos Paramètres, onglet 'Profil'. Vous pouvez y modifier votre identité numérique, votre biographie et vos liens vers les réseaux sociaux."
  },
  {
    category: 'Compte',
    question: "Comment supprimer mon compte et mes données ?",
    answer: "Vous pouvez demander la suppression de votre compte via le formulaire de contact. Conformément au RGPD, toutes vos données personnelles seront effacées de nos serveurs sous 30 jours."
  },
  {
    category: 'Technique',
    question: "Quelles langues sont supportées ?",
    answer: "NexusHub est multilingue : Français, Anglais, Swahili, Wolof, Yoruba et Hausa sont actuellement supportés avec l'aide de notre IA de traduction culturelle."
  },
  {
    category: 'Technique',
    question: "Quels outils sont disponibles pour l'accessibilité ?",
    answer: "Nous proposons la dictée vocale pour les scénaristes et des interfaces contrastées pour les lecteurs malvoyants. Notre lecteur supporte également les lecteurs d'écran standards."
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: 'HelpCircle' },
  { id: 'Lecture', label: 'Lecture', icon: 'BookOpen' },
  { id: 'Création', label: 'Création', icon: 'PenSquare' },
  { id: 'AfriCoins', label: 'AfriCoins', icon: 'Coins' },
  { id: 'Compte', label: 'Compte', icon: 'UserCircle' },
  { id: 'Technique', label: 'Technique', icon: 'Zap' },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 space-y-12">
      <SearchableFaq faqData={FAQ_DATA} categories={CATEGORIES} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24">
        <Card className="p-8 border-none bg-emerald-500/[0.03] rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:-rotate-12 transition-transform duration-1000"><Languages className="h-32 w-32 text-emerald-500" /></div>
          <div className="bg-emerald-500/10 p-3 rounded-2xl w-fit mb-6"><Languages className="h-6 w-6 text-emerald-500" /></div>
          <h4 className="text-xl font-display font-black text-emerald-500 mb-2">Support Multilingue</h4>
          <p className="text-stone-400 text-sm italic font-light leading-relaxed mb-6">"Besoin d'aide en Swahili ou Wolof ? Nos scribes sont disponibles pour vous répondre dans votre langue."</p>
          <Button variant="link" className="p-0 h-auto text-emerald-500 font-black text-[10px] uppercase tracking-widest">Contacter un scribe <ChevronRight className="h-3 w-3 ml-1" /></Button>
        </Card>

        <Card className="p-8 border-none bg-primary/[0.03] rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><ShieldCheck className="h-32 w-32 text-primary" /></div>
          <div className="bg-primary/10 p-3 rounded-2xl w-fit mb-6"><ShieldCheck className="h-6 w-6 text-primary" /></div>
          <h4 className="text-xl font-display font-black text-primary mb-2">Sécurité & Éthique</h4>
          <p className="text-stone-400 text-sm italic font-light leading-relaxed mb-6">"NexusHub protège vos créations et vos données. Consultez nos chartes de bienveillance communautaire."</p>
          <Button variant="link" className="p-0 h-auto text-primary font-black text-[10px] uppercase tracking-widest">Lire les chartes <ChevronRight className="h-3 w-3 ml-1" /></Button>
        </Card>
      </section>
    </div>
  );
}