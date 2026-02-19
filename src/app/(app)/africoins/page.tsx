'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coins, ShieldCheck, Zap, Globe, Wallet, Heart, ArrowRight, Info, CircleDollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AfriCoinsEconomyPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 bg-stone-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.2),transparent_60%)]" />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
            <Coins className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tighter">
            L'Économie <span className="text-primary text-glow">AfriCoins</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Une monnaie numérique conçue pour libérer le potentiel financier des artistes africains. Soutenez vos créateurs préférés et accédez au meilleur de la narration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 rounded-full font-bold text-lg">
              <Link href="/settings?tab=africoins">Recharger mon Solde</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/10">
              <Link href="/faq">Comment ça marche ?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-6">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">1. Rechargez</h3>
              <p className="text-muted-foreground leading-relaxed">
                Achetez des packs d'AfriCoins via carte bancaire, Mobile Money ou Bitcoin via notre passerelle sécurisée Binance Afrique.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-6">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">2. Soutenez</h3>
              <p className="text-muted-foreground leading-relaxed">
                Débloquez des chapitres Premium, faites des dons directs aux artistes ou achetez des produits dérivés officiels dans la boutique.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-6">
                <CircleDollarSign className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">3. Rémunérez</h3>
              <p className="text-muted-foreground leading-relaxed">
                Les artistes reçoivent leurs gains en temps réel et peuvent les convertir en devises locales (CFA, Naira, etc.) ou en crypto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 bg-stone-900 text-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="bg-stone-800 rounded-[2.5rem] p-8 md:p-16 border border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-0" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-6 bg-primary text-black border-none uppercase tracking-widest font-black">Powered by Blockchain</Badge>
                <h2 className="text-4xl font-display font-bold mb-6">Une technologie de pointe pour l'Afrique</h2>
                <p className="text-lg text-stone-400 mb-8 leading-relaxed">
                  Grâce à notre partenariat avec les plus grandes plateformes de cryptomonnaies du continent, nous éliminons les barrières bancaires traditionnelles. L'AfriCoin est rapide, sécurisé et transparent.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="font-bold">Sécurisation par Smart Contract</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Zap className="h-6 w-6 text-primary" />
                    <span className="font-bold">Transactions quasi-instantanées</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Globe className="h-6 w-6 text-primary" />
                    <span className="font-bold">Inter-opérabilité régionale</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
                  alt="Blockchain Technology" 
                  fill 
                  className="object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
