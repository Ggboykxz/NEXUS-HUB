'use client';

import Link from 'next/link';
import { BookOpen, Heart, Globe, ShieldCheck, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 mt-16 pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1">
             <Link href="/" className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-yellow-300 flex items-center justify-center shadow-md shadow-primary/10">
                    <BookOpen className="text-white h-3.5 w-3.5" />
                </div>
                <span className="font-display font-bold text-lg tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
            </Link>
            <p className="text-foreground/60 dark:text-stone-400 text-xs leading-relaxed max-w-xs font-light mb-6">
              Le hub créatif de la narration visuelle africaine. Une plateforme dédiée à l'éclosion des talents et à la célébration de nos cultures.
            </p>
            
            <div className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary/80">Suivez l'aventure !</p>
              <div className="flex gap-4">
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="X (Twitter)">
                  <i className="fa-brands fa-x-twitter text-lg"></i>
                </Link>
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="Instagram">
                  <i className="fa-brands fa-instagram text-lg"></i>
                </Link>
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f text-lg"></i>
                </Link>
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="Discord">
                  <i className="fa-brands fa-discord text-lg"></i>
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">Bibliothèque</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/stories" className="hover:text-primary transition-colors">Tout le Catalogue</Link></li>
              <li><Link href="/webtoon" className="hover:text-primary transition-colors">Univers Webtoons</Link></li>
              <li><Link href="/bd-africaine" className="hover:text-primary transition-colors">Bandes Dessinées</Link></li>
              <li><Link href="/rankings" className="hover:text-primary transition-colors">Elite du Hub</Link></li>
              <li><Link href="/new-releases" className="hover:text-primary transition-colors">Dernières Sorties</Link></li>
              <li><Link href="/ongoing" className="hover:text-primary transition-colors">Séries en Cours</Link></li>
              <li><Link href="/completed" className="hover:text-primary transition-colors">Séries Terminées</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">Création</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/pro" className="hover:text-primary transition-colors font-bold text-emerald-500">NexusHub Pro</Link></li>
              <li><Link href="/draft" className="hover:text-primary transition-colors font-bold text-orange-400">NexusHub Draft</Link></li>
              <li><Link href="/submit" className="hover:text-primary transition-colors">Lancer un Projet</Link></li>
              <li><Link href="/artists" className="hover:text-primary transition-colors">Nos Créateurs</Link></li>
              <li><Link href="/mentorship" className="hover:text-primary transition-colors">Programme Mentorat</Link></li>
              <li><Link href="/dashboard/creations" className="hover:text-primary transition-colors">Mon Atelier</Link></li>
              <li><Link href="/dashboard/world-building" className="hover:text-primary transition-colors">World Building</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">Communauté</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/africoins" className="hover:text-primary transition-colors font-semibold text-primary">Économie AfriCoins</Link></li>
              <li><Link href="/forums" className="hover:text-primary transition-colors">Forums & Discussions</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog & Ressources</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">Boutique Goodies</Link></li>
              <li><Link href="/library" className="hover:text-primary transition-colors">Ma Bibliothèque</Link></li>
              <li><Link href="/notifications" className="hover:text-primary transition-colors">Notifications</Link></li>
              <li><Link href="/messages" className="hover:text-primary transition-colors">Messages Privés</Link></li>
            </ul>
          </div>

           <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">NexusHub</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/about" className="hover:text-primary transition-colors font-medium">À Propos</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact / Support</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/legal/terms" className="hover:text-primary transition-colors">Mentions Légales</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-primary transition-colors">Cookies</Link></li>
              <li><Link href="/settings" className="hover:text-primary transition-colors font-medium text-foreground">Paramètres</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center border-t border-border/50 pt-6 gap-4">
           <div className="flex flex-col sm:flex-row items-center text-[10px] text-foreground/40 font-light gap-4 flex-wrap justify-center sm:justify-start">
             <div className="flex items-center gap-4">
                <p>&copy; 2026 NexusHub – Tous droits réservés.</p>
                <div className="hidden sm:flex gap-3">
                    <span>Libreville</span>
                    <span>Dakar</span>
                    <span>Lagos</span>
                    <span>Abidjan</span>
                </div>
             </div>
             
             <div className="flex items-center gap-1.5 font-medium sm:border-l border-border/50 sm:pl-4">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-destructive fill-destructive" />
                <span>in Gabon 🇬🇦</span>
             </div>

             <div className="flex flex-col items-center sm:items-start justify-center font-semibold sm:border-l border-border/50 sm:pl-4">
                <span className="leading-tight text-foreground/60">
                  Développé par <a href="mailto:ggboykxz@gmail.com" className="text-destructive hover:opacity-80 transition-colors">@All Might</a>
                </span>
             </div>
           </div>
           <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-[9px] text-foreground/30 uppercase tracking-[0.2em] font-bold">
                <ShieldCheck className="h-3 w-3" />
                <span>Plateforme Sécurisée</span>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
}
