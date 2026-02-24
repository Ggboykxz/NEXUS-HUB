'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, Zap, Globe, Wallet, Heart, 
  CircleDollarSign, Smartphone, CreditCard, Bitcoin, 
  ArrowRight, Landmark, ArrowUpRight, Check, Crown, Flame, Star,
  Gift, Share2, MessageSquare, Trophy, Clock, Users, Award, Eye
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AfriCoinsEconomyPage() {
  const [region, setRegion] = useState<'EU' | 'WA' | 'EA'>('EU');

  const pricing = {
    EU: { currency: '€', packs: [{ coins: 50, price: '1,00' }, { coins: 100, price: '1,99' }, { coins: 550, price: '9,99' }] },
    WA: { currency: 'FCFA', packs: [{ coins: 50, price: '100' }, { coins: 100, price: '200' }, { coins: 550, price: '1000' }] },
    EA: { currency: 'KES', packs: [{ coins: 50, price: '5' }, { coins: 100, price: '10' }, { coins: 550, price: '50' }] },
  };

  const rewards = [
    { icon: Clock, title: "Streak de Lecture", reward: "+2 🪙 / jour", desc: "Lisez au moins 5 minutes par jour. Max 14 coins par semaine." },
    { icon: Eye, title: "Pub Récompensée", reward: "+1 🪙 / pub", desc: "Regardez une courte séquence de 6s pour soutenir vos artistes." },
    { icon: Share2, title: "Parrainage Lecteur", reward: "+5 🪙 / ami", desc: "Dès que votre ami crée son compte et lit son premier chapitre." },
    { icon: Award, title: "Parrainage Artiste", reward: "+20 🪙 / Pro", desc: "Bonus massif si l'artiste que vous parrainez atteint le niveau Pro." },
  ];

  const currentPricing = pricing[region];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 bg-stone-950 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.2),transparent_60%)]" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 text-center space-y-8">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_50px_hsl(var(--primary)/0.3)] animate-pulse">
            <Coins className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-black text-white mb-6 tracking-tighter leading-none">
            L'Économie <br/><span className="text-primary gold-resplendant">Participative</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-3xl mx-auto leading-relaxed font-light italic">
            "Soutenez vos artistes préférés au prix juste. Gagnez des coins en lisant, ou parrainez les futurs talents du continent."
          </p>
          
          <div className="flex justify-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mx-auto backdrop-blur-xl">
            {(['EU', 'WA', 'EA'] as const).map((r) => (
              <Button 
                key={r} 
                onClick={() => setRegion(r)}
                variant={region === r ? 'default' : 'ghost'} 
                className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest"
              >
                {r === 'EU' ? 'Europe' : r === 'WA' ? 'Afrique Ouest' : 'Afrique Est'}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Grid */}
      <section className="py-24 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-display font-black uppercase tracking-tight flex items-center justify-center gap-3">
              <Gift className="text-primary h-8 w-8" /> Gagnez sans dépenser
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto italic font-light">Valorisez votre temps et votre réseau. Plus vous aidez le Hub à grandir, plus vous gagnez.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {rewards.map((reward, i) => (
              <Card key={i} className="bg-card border-border/50 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all">
                <CardHeader className="p-8 pb-4">
                  <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <reward.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{reward.title}</CardTitle>
                  <p className="text-primary font-black text-2xl mt-2">{reward.reward}</p>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed italic">"{reward.desc}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-display font-black uppercase tracking-tight">Recharge Instantanée</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto italic font-light">Packs ultra-accessibles via Mobile Money, Carte ou Crypto.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {currentPricing.packs.map((pack, i) => (
              <Card key={i} className={cn(
                "relative overflow-hidden border-2 transition-all hover:shadow-2xl rounded-[2.5rem]",
                i === 1 ? "border-primary bg-primary/5 scale-105" : "border-border/50"
              )}>
                {i === 1 && <div className="absolute top-4 right-4 bg-primary text-black text-[8px] font-black uppercase px-2 py-1 rounded-full">Populaire</div>}
                <CardHeader className="text-center pt-10">
                  <p className="text-5xl font-black mb-2">{pack.coins} 🪙</p>
                  <CardDescription className="uppercase tracking-widest font-bold text-[10px]">Pack {i === 0 ? 'Starter' : i === 1 ? 'Standard' : 'Elite'}</CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-10">
                  <p className="text-3xl font-display font-black mb-8">{pack.price} {currentPricing.currency}</p>
                  <Button className={cn("w-full h-14 rounded-2xl font-black text-lg", i === 1 ? "bg-primary text-black" : "bg-white/10 text-foreground")}>Acheter ce pack</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Special Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Fast Lane", coins: "5", desc: "Lisez 3 jours avant tout le monde.", color: "text-amber-500 bg-amber-500/10" },
              { icon: Crown, title: "Pass Mensuel", coins: "30", desc: "Accès illimité aux séries Pro.", color: "text-emerald-500 bg-emerald-500/10" },
              { icon: Star, title: "Ticket VIP", coins: "50", desc: "Saison complète à prix réduit.", color: "text-primary bg-primary/10" },
            ].map((tier, i) => (
              <div key={i} className="group p-8 rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/30 transition-all flex flex-col items-center text-center">
                <div className={cn("p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform", tier.color)}>
                  <tier.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black font-display mb-2">{tier.title}</h3>
                <p className="text-sm text-muted-foreground italic mb-6 font-light">"{tier.desc}"</p>
                <Badge variant="secondary" className="h-8 px-6 rounded-full font-black text-xs">{tier.coins} 🪙</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="text-3xl font-display font-black">Liberté Financière Créative</h2>
          <p className="text-muted-foreground text-lg font-light italic">
            "Que vous soyez au Gabon, au Sénégal ou en France, nous adaptons nos services pour que l'art panafricain ne connaisse aucune barrière monétaire."
          </p>
          <Button asChild size="lg" className="rounded-full px-12 h-16 font-black text-xl shadow-2xl shadow-primary/20 bg-primary text-black gold-shimmer">
            <Link href="/settings?tab=africoins">Choisir mon Mode de Recharge <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
