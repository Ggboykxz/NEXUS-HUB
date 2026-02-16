'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search } from 'lucide-react';
import { navLinks } from '@/lib/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-transparent dark:bg-zinc-900/95">
      <div className="container flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">AfriStory<span className="text-primary">.</span></span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-10 text-sm font-medium tracking-wide text-foreground/80 dark:text-stone-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'hover:text-primary transition-colors duration-300',
                pathname === link.href ? 'text-foreground dark:text-white font-semibold' : ''
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Icons for desktop, menu for mobile */}
        <div className="flex items-center gap-2">
            {/* Desktop Icons & Buttons */}
            <div className="hidden items-center gap-2 md:flex">
               <Button variant="ghost" size="icon" className="text-foreground/90">
                  <Search className="h-5 w-5" />
               </Button>
               <Button asChild variant="ghost">
                 <Link href="/login">Se connecter</Link>
               </Button>
               <Button asChild variant="outline">
                 <Link href="/signup">S'inscrire</Link>
               </Button>
               <Button asChild>
                 <Link href="/submit">Publier</Link>
               </Button>
            </div>
            
            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
                <Button variant="ghost" size="icon" className="text-foreground/90">
                  <Search className="h-5 w-5" />
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="pr-0 bg-background flex flex-col">
                    <div>
                        <Link href="/" className="flex items-center space-x-2 px-4 pt-4 mb-6">
                            <span className="font-display font-bold text-2xl tracking-tight text-foreground">AfriStory<span className="text-primary">.</span></span>
                        </Link>
                        <nav className="flex flex-col space-y-3 px-4">
                            {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="text-lg font-medium">
                                {link.label}
                            </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto flex flex-col gap-2 border-t p-4">
                       <Button asChild>
                         <Link href="/submit">Publier</Link>
                       </Button>
                       <Button asChild variant="outline">
                         <Link href="/signup">S'inscrire</Link>
                       </Button>
                       <Button asChild variant="ghost">
                         <Link href="/login">Se connecter</Link>
                       </Button>
                    </div>
                  </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
