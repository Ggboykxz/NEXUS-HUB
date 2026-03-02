'use client';

import Link from 'next/link';
import { BookOpen, Heart, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../providers/language-provider';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-background border-t border-border/50 mt-16 pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1">
             <Link href="/" className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-yellow-300 flex items-center justify-center shadow-md shadow-primary/10">
                    <BookOpen className="text-white h-3.5 w-3.5" />
                </div>
                <span className="font-display font-bold text-lg tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
            </Link>
            <p className="text-foreground/60 dark:text-stone-400 text-xs leading-relaxed max-w-xs font-light mb-6">
              {t('footer.desc')}
            </p>
            
            <div className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary/80">{t('footer.follow_us')}</p>
              <div className="flex gap-4">
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="X (Twitter)">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </Link>
                <Link href="#" className="text-foreground/40 hover:text-primary transition-colors" aria-label="Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">{t('footer.library')}</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/stories" className="hover:text-primary transition-colors">{t('nav.browse')} Tout</Link></li>
              <li><Link href="/webtoon-hub" className="hover:text-primary transition-colors">Univers Webtoons</Link></li>
              <li><Link href="/bd-africaine" className="hover:text-primary transition-colors">Bandes Dessinées</Link></li>
              <li><Link href="/rankings" className="hover:text-primary transition-colors">{t('nav.rankings')}</Link></li>
              <li><Link href="/new-releases" className="hover:text-primary transition-colors">{t('home.new')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">{t('footer.creation')}</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/submit" className="hover:text-primary transition-colors">{t('nav.submit')}</Link></li>
              <li><Link href="/artists" className="hover:text-primary transition-colors">{t('nav.artists')}</Link></li>
              <li><Link href="/mentorship" className="hover:text-primary transition-colors">Programme Mentorat</Link></li>
              <li><Link href="/dashboard/creations" className="hover:text-primary transition-colors">{t('nav.workshop')}</Link></li>
              <li><Link href="/dashboard/world-building" className="hover:text-primary transition-colors">World Building</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">{t('footer.community')}</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/forums" className="hover:text-primary transition-colors">{t('nav.forums')}</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog & Ressources</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">{t('nav.shop')}</Link></li>
              <li><Link href="/library" className="hover:text-primary transition-colors">{t('nav.library')}</Link></li>
              <li><Link href="/playlists" className="hover:text-primary transition-colors">{t('nav.playlists')}</Link></li>
            </ul>
          </div>

           <div>
            <h4 className="font-bold mb-5 text-[11px] text-foreground uppercase tracking-widest">{t('footer.support')}</h4>
            <ul className="space-y-2.5 text-xs text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/legal/terms" className="hover:text-primary transition-colors">Mentions Légales</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
              <li><Link href="/settings" className="hover:text-primary transition-colors">{t('nav.settings')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center border-t border-border/50 pt-6 gap-4">
           <div className="flex flex-col sm:flex-row items-center text-[10px] text-foreground/40 font-light gap-4 flex-wrap justify-center sm:justify-start">
             <div className="flex items-center gap-4">
                <p>&copy; 2026 NexusHub – {t('footer.rights')}</p>
             </div>
             
             <div className="flex items-center gap-1.5 font-medium sm:border-l border-border/50 sm:pl-4">
                <span>{t('footer.made_with')}</span>
                <Heart className="h-3 w-3 text-destructive fill-destructive" />
                <span>{t('footer.in_gabon')} 🇬🇦</span>
             </div>
           </div>
           <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-[9px] text-foreground/30 uppercase tracking-[0.2em] font-bold">
                <ShieldCheck className="h-3 w-3" />
                <span>Inclusion & Créativité</span>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
}
