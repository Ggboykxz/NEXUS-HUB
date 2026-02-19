import Link from "next/link";
import { Sparkles, Zap, Users, Award, ChevronDown } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-950 selection:bg-primary/20">
      {/* Hero Section - Premier écran (Adapté pour commencer sous le header) */}
      <section className="relative min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center overflow-hidden px-4 border-b border-primary/10">
        {/* Fond : Gradient gold resplendissant avec animations */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)]" />
          <div className="hero-pattern opacity-[0.03] pointer-events-none" />
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse duration-[4000ms]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center space-y-10">
          {/* Logo supprimé ici car présent dans le Header au-dessus */}

          <div className="space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
            <h1 className="text-4xl md:text-7xl font-display font-black leading-[1.1] text-white tracking-tighter drop-shadow-[0_0_20px_rgba(212,168,67,0.3)]">
              Rejoignez NexusHub – <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Créez</span> et Découvrez des Histoires Africaines
            </h1>

            <p className="text-lg md:text-2xl text-stone-300 font-light max-w-3xl mx-auto leading-relaxed italic">
              Devenez artiste Pro/Draft, lisez gratuitement, connectez-vous à une communauté panafricaine. 
              <span className="block font-bold text-primary mt-3 uppercase tracking-[0.1em] text-sm md:text-base">Inscription gratuite et instantanée !</span>
            </p>
          </div>

          {/* Teaser bullets scintillantes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto pt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {[
              { icon: Zap, text: "Publiez vos BD/webtoons en un clic" },
              { icon: Sparkles, text: "Accédez à des univers mythologiques" },
              { icon: Users, text: "Soutenez des créateurs gabonais" },
              { icon: Award, text: "AfriCoins et chapitres premium" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl group hover:border-primary/50 hover:bg-white/[0.08] transition-all duration-500 shadow-2xl">
                <div className="bg-primary/20 p-2.5 rounded-xl group-hover:bg-primary/40 group-hover:scale-110 transition-all duration-500">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm md:base font-bold text-stone-200 tracking-tight text-left leading-tight">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-16 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-700">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-primary/60">Commencez ci-dessous</p>
            <ChevronDown className="h-8 w-8 text-primary animate-bounce" />
          </div>
        </div>
      </section>

      {/* Form Section - Formulaire d'Auth */}
      <section className="relative flex flex-col items-center justify-center py-24 px-6 bg-stone-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
          {children}
        </div>
        
        <p className="mt-12 text-[9px] text-stone-600 uppercase font-bold tracking-[0.2em] text-center max-w-xs leading-relaxed">
          En vous connectant, vous rejoignez le premier hub créatif panafricain.
        </p>
      </section>
    </div>
  );
}
