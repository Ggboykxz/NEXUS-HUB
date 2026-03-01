'use client';

import { useState, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, Coins, Languages, Accessibility, 
  ShieldCheck, Search, X, BookOpen, PenSquare, 
  UserCircle, Zap, Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FaqItem {
  question: string;
  answer: string;
  category: 'Lecture' | 'Création' | 'AfriCoins' | 'Compte' | 'Technique';
}

const FAQ_DATA: FaqItem[] = [
  // LECTURE
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
  // CRÉATION
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
  // AFRICOINS
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
  // COMPTE
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
  // TECHNIQUE
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
  { id: 'all', label: 'Tout', icon: HelpCircle },
  { id: 'Lecture', label: 'Lecture', icon: BookOpen },
  { id: 'Création', label: 'Création', icon: PenSquare },
  { id: 'AfriCoins', label: 'AfriCoins', icon: Coins },
  { id: 'Compte', label: 'Compte', icon: UserCircle },
  { id: 'Technique', label: 'Technique', icon: Zap },
];

export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesSearch = 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5 font-bold decoration-primary/50 underline-offset-2">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 space-y-12">
      {/* 1. HERO SECTION & SEARCH */}
      <section className="text-center space-y-8 relative py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)] -z-10" />
        
        <div className="space-y-4">
          <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Centre d'Assistance</Badge>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tighter text-white">Questions <span className="gold-resplendant">Fréquentes</span></h1>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto italic font-light leading-relaxed">
            "Inclusion, Technologie et Créativité. Trouvez les clés pour maîtriser l'univers du Hub."
          </p>
        </div>

        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un mot-clé (ex: AfriCoins, hors-ligne...)" 
            className="h-16 pl-14 pr-14 text-lg rounded-2xl bg-stone-900/50 border-white/5 focus:border-primary/50 shadow-2xl transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </section>

      {/* 2. CATEGORY FILTERS */}
      <div className="flex flex-wrap justify-center gap-3 bg-muted/30 p-2 rounded-[2rem] border border-border/50 max-w-fit mx-auto">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            variant={activeCategory === cat.id ? 'default' : 'ghost'}
            className={cn(
              "rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest h-11 px-6 transition-all",
              activeCategory === cat.id ? "bg-primary text-black shadow-xl" : "text-stone-500 hover:text-white"
            )}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* 3. RESULTS INFO */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tighter">
            {searchTerm ? (
              <>Résultats pour "<span className="text-primary">{searchTerm}</span>"</>
            ) : (
              activeCategory === 'all' ? 'Toutes les questions' : `Catégorie : ${activeCategory}`
            )}
          </h2>
        </div>
        <Badge variant="secondary" className="bg-white/5 text-stone-500 border-none px-3 font-black uppercase text-[9px] tracking-widest">
          {filteredFaqs.length} entrées
        </Badge>
      </div>

      {/* 4. ACCORDION LIST */}
      <div className="space-y-6">
        {filteredFaqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-white/5 bg-card/50 backdrop-blur-sm rounded-2xl px-6 transition-all data-[state=open]:border-primary/20 data-[state=open]:bg-primary/[0.02]"
              >
                <AccordionTrigger className="text-left py-6 hover:no-underline hover:text-primary transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0 hidden sm:block">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <span className="text-sm md:text-base font-bold leading-tight">
                      {highlightText(faq.question, searchTerm)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                  <div className="pl-0 sm:pl-12 space-y-4">
                    <p className="text-sm md:text-base text-stone-400 leading-relaxed font-light italic">
                      {highlightText(faq.answer, searchTerm)}
                    </p>
                    <div className="flex items-center gap-2 pt-4">
                      <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5">
                        {faq.category}
                      </Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-24 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6 animate-in zoom-in-95 duration-500">
            <div className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center opacity-20">
              <Search className="h-10 w-10 text-stone-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-white tracking-tighter">Aucune réponse trouvée</h3>
              <p className="text-stone-500 italic font-light max-w-xs mx-auto">"Essayez d'autres mots-clés ou parcourez nos catégories pour trouver votre chemin."</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
              className="rounded-full border-primary text-primary font-black text-[10px] uppercase tracking-widest px-8"
            >
              Réinitialiser la recherche
            </Button>
          </div>
        )}
      </div>

      {/* 5. QUICK HELP FOOTER */}
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

function ChevronRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}
