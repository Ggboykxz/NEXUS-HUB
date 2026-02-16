import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { Twitter, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
              <span className="font-bold text-lg font-headline">AfriStory Hub</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Celebrating and promoting African visual storytelling.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold font-headline text-md mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/stories" className="text-muted-foreground hover:text-primary transition-colors">Browse Stories</Link></li>
              <li><Link href="/artists" className="text-muted-foreground hover:text-primary transition-colors">Our Artists</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold font-headline text-md mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/forums" className="text-muted-foreground hover:text-primary transition-colors">Forums</Link></li>
              <li><Link href="/submit" className="text-muted-foreground hover:text-primary transition-colors">Submit Your Work</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold font-headline text-md mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AfriStory Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
