'use client';

import Link from 'next/link';
import { BookOpen, Twitter, Instagram, Facebook, Youtube, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 mt-16 pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
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
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary/80">Suivez-nous pour les updates et concours !</p>
              <div className="flex gap-4">
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="X (Twitter)">
                  <Twitter className="w-4.5 h-4.5" />
                </Link>
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="Instagram">
                  <Instagram className="w-4.5 h-4.5" />
                </Link>
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="Facebook">
                  <Facebook className="w-4.5 h-4.5" />
                </Link>
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="Discord">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
                  </svg>
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
              <li><Link href="/completed" className="hover:text-primary transition-colors">Séries Terminées</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">Création</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/submit" className="hover:text-primary transition-colors">Soumettre Votre Projet</Link></li>
              <li><Link href="/artists" className="hover:text-primary transition-colors">Nos Créateurs</Link></li>
              <li><Link href="/mentorship" className="hover:text-primary transition-colors">Programme Mentorat</Link></li>
              <li><Link href="/dashboard/creations" className="hover:text-primary transition-colors">Mon Atelier</Link></li>
              <li><Link href="/dashboard/world-building" className="hover:text-primary transition-colors">Outils World Building</Link></li>
              <li><Link href="/submit" className="hover:text-primary transition-colors font-semibold text-emerald-500">Devenir NexusHub Pro</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">Communauté</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/forums" className="hover:text-primary transition-colors">Rejoindre la Communauté</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog & Ressources</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">Boutique Goodies</Link></li>
              <li><Link href="/library" className="hover:text-primary transition-colors">Ma Bibliothèque</Link></li>
              <li><Link href="/playlists" className="hover:text-primary transition-colors">Mes Playlists</Link></li>
              <li><Link href="/notifications" className="hover:text-primary transition-colors">Mes Notifications</Link></li>
            </ul>
          </div>

           <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">Support & Légal</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact / Feedback</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/legal/terms" className="hover:text-primary transition-colors">Mentions Légales</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-primary transition-colors">Cookies</Link></li>
              <li><Link href="/settings" className="hover:text-primary transition-colors">Paramètres</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-border/50 pt-6 gap-4">
           <div className="flex items-center text-[10px] text-foreground/40 font-light gap-4 flex-wrap justify-center sm:justify-start">
             <p>&copy; 2026 NexusHub – Tous droits réservés.</p>
             <div className="hidden sm:flex gap-3">
                <span>Libreville</span>
                <span>Dakar</span>
                <span>Lagos</span>
                <span>Abidjan</span>
             </div>
             <div className="flex items-center gap-1.5 font-medium ml-0 sm:ml-4 border-l border-border/50 pl-4">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-destructive fill-destructive" />
                <span>in Gabon 🇬🇦</span>
             </div>
           </div>
           <div className="flex items-center gap-5">
              <p className="text-[9px] text-foreground/30 uppercase tracking-[0.2em] font-bold">Inclusion & Créativité</p>
           </div>
        </div>
      </div>
    </footer>
  );
}
