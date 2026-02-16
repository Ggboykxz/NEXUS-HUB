'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ArrowLeft } from 'lucide-react';
import { navLinks } from '@/lib/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

export default function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  if (isSearchOpen && isMobile) {
    return (
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className={cn(
            "container flex max-w-7xl items-center justify-between px-6 lg:px-12 transition-all duration-300",
            isScrolled ? "h-16" : "h-20"
        )}>
            <div className="flex w-full items-center gap-2 animate-in fade-in-0">
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Input
                    type="search"
                    placeholder="Rechercher..."
                    className="h-10 w-full pr-10"
                    autoFocus
                />
            </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className={cn(
        "container flex max-w-7xl items-center justify-between px-6 lg:px-12 transition-all duration-300",
        isScrolled ? "h-16" : "h-20"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
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
               {isSearchOpen ? (
                    <div className="relative animate-in fade-in-0 slide-in-from-right-4 duration-300">
                    <Input
                        type="search"
                        placeholder="Rechercher..."
                        className="h-10 w-56 pr-10"
                        autoFocus
                        onBlur={() => setIsSearchOpen(false)}
                    />
                    <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                ) : (
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-foreground/90">
                        <Search className="h-5 w-5" />
                    </Button>
                )}
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
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-foreground/90">
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
                            <span className="font-display font-bold text-2xl tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
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
