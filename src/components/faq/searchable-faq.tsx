'use client';

import { useState, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, Search, X, Filter, BookOpen, PenSquare, UserCircle, Zap, Coins
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface SearchableFaqProps {
  faqData: FaqItem[];
  categories: Category[];
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  HelpCircle,
  BookOpen,
  PenSquare,
  UserCircle,
  Zap,
  Coins
};

export function SearchableFaq({ faqData, categories }: SearchableFaqProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFaqs = useMemo(() => {
    return faqData.filter(item => {
      const matchesSearch = 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, faqData]);

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
    <div className="space-y-12">
      {/* SEARCH SECTION */}
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

      {/* CATEGORY FILTERS */}
      <div className="flex flex-wrap justify-center gap-3 bg-muted/30 p-2 rounded-[2rem] border border-border/50 max-w-fit mx-auto">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || HelpCircle;
          return (
            <Button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              variant={activeCategory === cat.id ? 'default' : 'ghost'}
              className={cn(
                "rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest h-11 px-6 transition-all",
                activeCategory === cat.id ? "bg-primary text-black shadow-xl" : "text-stone-500 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* RESULTS INFO */}
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

      {/* ACCORDION LIST */}
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
    </div>
  );
}
