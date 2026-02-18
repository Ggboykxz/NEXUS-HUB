import Link from 'next/link';
import { BookOpen, Twitter, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 mt-24 pt-20 pb-12">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
             <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-yellow-300 flex items-center justify-center">
                    <BookOpen className="text-white h-4 w-4" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-foreground">NexusHub</span>
            </Link>
            <p className="text-foreground/60 dark:text-stone-400 text-sm leading-relaxed max-w-sm font-light">
              Célébrer et promouvoir la narration visuelle africaine. Une plateforme pour les artistes, par des passionnés.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm text-foreground">Explorer</h4>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/stories" className="hover:text-primary transition-colors">Parcourir</Link></li>
              <li><Link href="/rankings" className="hover:text-primary transition-colors">Classements</Link></li>
              <li><Link href="/artists" className="hover:text-primary transition-colors">Artistes</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog & Ressources</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm text-foreground">Communauté</h4>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/forums" className="hover:text-primary transition-colors">Forums</Link></li>
              <li><Link href="/submit" className="hover:text-primary transition-colors">Publier</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">Boutique</Link></li>
            </ul>
          </div>
           <div>
            <h4 className="font-bold mb-6 text-sm text-foreground">Informations</h4>
            <ul className="space-y-3 text-sm text-foreground/70 dark:text-stone-400 font-light">
              <li><Link href="/about" className="hover:text-primary transition-colors">À propos</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-border/50 pt-8 gap-4">
           <div className="flex items-center text-xs text-foreground/60 font-light gap-4 flex-wrap justify-center">
             <p>&copy; {new Date().getFullYear()} NexusHub. Tous droits réservés.</p>
             <div className="flex gap-4">
                <Link href="/legal/terms" className="hover:text-primary transition-colors">Mentions Légales</Link>
                <Link href="/legal/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
             </div>
           </div>
           <div className="flex gap-4">
              <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
