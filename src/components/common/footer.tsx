import Link from 'next/link';
import { BookOpen, Twitter, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 mt-24 pt-20 pb-12">
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-yellow-300 flex items-center justify-center">
                <BookOpen className="text-white h-4 w-4" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">AfriStory Hub</span>
            </div>
            <p className="text-foreground/60 dark:text-stone-400 text-sm leading-relaxed max-w-sm font-light">
              Celebrating and promoting African visual storytelling. A platform for artists, by enthusiasts.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:w-2/3">
            <div>
              <h4 className="font-bold mb-6 text-sm text-foreground">Quick Links</h4>
              <ul className="space-y-3 text-sm text-foreground/70 dark:text-stone-400 font-light">
                <li><Link href="/stories" className="hover:text-primary transition-colors">Browse Stories</Link></li>
                <li><Link href="/artists" className="hover:text-primary transition-colors">Our Artists</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm text-foreground">Community</h4>
              <ul className="space-y-3 text-sm text-foreground/70 dark:text-stone-400 font-light">
                <li><Link href="/forums" className="hover:text-primary transition-colors">Forums</Link></li>
                <li><Link href="/submit" className="hover:text-primary transition-colors">Submit Your Work</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm text-foreground">Follow Us</h4>
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
        </div>
        <div className="border-t border-border/50 pt-8 text-center text-xs text-foreground/40 font-light">
          <p>&copy; {new Date().getFullYear()} AfriStory Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
