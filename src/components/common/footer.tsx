import Link from 'next/link';
import { BookOpen, Twitter, Instagram, Facebook, Youtube, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 mt-24 pt-20 pb-12">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
             <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-yellow-300 flex items-center justify-center shadow-lg shadow-primary/20">
                    <BookOpen className="text-white h-4 w-4" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
            </Link>
            <p className="text-foreground/60 dark:text-stone-400 text-sm leading-relaxed max-w-xs font-light mb-6">
              Le hub créatif de la narration visuelle africaine. Une plateforme dédiée à l'éclosion des talents et à la célébration de nos cultures.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-foreground/40 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-foreground/40 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-foreground/40 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-foreground/40 hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm text-foreground uppercase tracking-widest">Bibliothèque</h4>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/stories" className="hover:text-primary transition-colors">Tout le Catalogue</Link></li>
              <li><Link href="/webtoon" className="hover:text-primary transition-colors">Univers Webtoons</Link></li>
              <li><Link href="/bd-africaine" className="hover:text-primary transition-colors">Bandes Dessinées</Link></li>
              <li><Link href="/rankings" className="hover:text-primary transition-colors">Elite du Hub (Classements)</Link></li>
              <li><Link href="/new-releases" className="hover:text-primary transition-colors">Dernières Sorties</Link></li>
              <li><Link href="/completed" className="hover:text-primary transition-colors">Séries Terminées</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm text-foreground uppercase tracking-widest">Création</h4>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/submit" className="hover:text-primary transition-colors">Soumettre Votre Projet</Link></li>
              <li><Link href="/artists" className="hover:text-primary transition-colors">Nos Créateurs</Link></li>
              <li><Link href="/mentorship" className="hover:text-primary transition-colors">Programme Mentorat</Link></li>
              <li><Link href="/dashboard/creations" className="hover:text-primary transition-colors">Mon Atelier</Link></li>
              <li><Link href="/dashboard/world-building" className="hover:text-primary transition-colors">Outils World Building</Link></li>
              <li><Link href="/submit" className="hover:text-primary transition-colors font-semibold text-emerald-500">Devenir NexusHub Pro</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm text-foreground uppercase tracking-widest">Communauté</h4>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/forums" className="hover:text-primary transition-colors">Rejoindre la Communauté</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog & Ressources</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">Boutique Goodies</Link></li>
              <li><Link href="/library" className="hover:text-primary transition-colors">Ma Bibliothèque</Link></li>
              <li><Link href="/playlists" className="hover:text-primary transition-colors">Mes Playlists</Link></li>
              <li><Link href="/notifications" className="hover:text-primary transition-colors">Mes Notifications</Link></li>
            </ul>
          </div>

           <div>
            <h4 className="font-bold mb-6 text-sm text-foreground uppercase tracking-widest">Support & Légal</h4>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact / Feedback</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">Foire Aux Questions (FAQ)</Link></li>
              <li><Link href="/legal/terms" className="hover:text-primary transition-colors">Mentions Légales / CGU</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-primary transition-colors">Politique de Confidentialité</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-primary transition-colors">Gestion des Cookies</Link></li>
              <li><Link href="/settings" className="hover:text-primary transition-colors">Paramètres du Compte</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-border/50 pt-8 gap-4">
           <div className="flex items-center text-xs text-foreground/40 font-light gap-4 flex-wrap justify-center sm:justify-start">
             <p>&copy; {new Date().getFullYear()} NexusHub. Fabriqué avec passion pour l'Afrique.</p>
             <div className="hidden sm:flex gap-4">
                <span>Libreville</span>
                <span>Dakar</span>
                <span>Lagos</span>
                <span>Abidjan</span>
             </div>
           </div>
           <div className="flex items-center gap-6">
              <p className="text-[10px] text-foreground/30 uppercase tracking-[0.2em] font-bold">Inclusion & Créativité</p>
           </div>
        </div>
      </div>
    </footer>
  );
}
