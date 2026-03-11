
'use client';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { SearchableFaq } from '@/components/faq/searchable-faq';
import { ChevronRight, Languages, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CATEGORIES = [
  { id: 'all', label: 'Tout', icon: 'HelpCircle' },
  { id: 'Lecture', label: 'Lecture', icon: 'BookOpen' },
  { id: 'Création', label: 'Création', icon: 'PenSquare' },
  { id: 'AfriCoins', label: 'AfriCoins', icon: 'Coins' },
  { id: 'Compte', label: 'Compte', icon: 'UserCircle' },
  { id: 'Technique', label: 'Technique', icon: 'Zap' },
];

export default function FaqPage() {
  const { data: faqData = [], isLoading } = useQuery({
    queryKey: ['faq-data'],
    queryFn: async () => {
      const q = query(collection(db, 'faq'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as any);
    }
  });

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 space-y-12">
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-stone-500 uppercase font-black text-[10px] tracking-widest">Ouverture du centre d'aide...</p>
        </div>
      ) : (
        <SearchableFaq faqData={faqData} categories={CATEGORIES} />
      )}

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
