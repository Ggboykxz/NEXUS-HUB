'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ArrowLeft, Bell, UserCircle, LogOut, Settings } from 'lucide-react';
import { navLinks } from '@/lib/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);
    };

    // This check is for client-side rendering only.
    if (typeof window !== 'undefined') {
        handleStorageChange();
    }

    // Listen for changes (e.g., from other tabs or our custom event)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginStateChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStateChange', handleStorageChange);
    };
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    // Dispatch custom event to update header immediately in the same tab
    window.dispatchEvent(new Event('loginStateChange')); 
    router.push('/');
    router.refresh();
  };

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
               <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-foreground/90">
                    <Search className="h-5 w-5" />
                </Button>
               
               {isLoggedIn ? (
                 <>
                   <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="relative text-foreground/90">
                              <Bell className="h-5 w-5" />
                              <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                              </span>
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-96">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium leading-none">Notifications</h4>
                            <p className="text-sm text-muted-foreground">Vous avez 2 notifications</p>
                          </div>
                          <div className="grid gap-4">
                            <Link href="/stories/1" className="group flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-muted transition-colors">
                              <Avatar className="h-10 w-10 border">
                                  <AvatarImage src="https://images.unsplash.com/photo-1739513261598-d1025613319b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxmYW50YXN5JTIwY29taWN8ZW58MHx8fHwxNzcxMjA4MjY5fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="The Orisha Chronicles" />
                                  <AvatarFallback>OC</AvatarFallback>
                              </Avatar>
                              <div>
                                  <p className="text-sm">Nouveau chapitre de <span className="font-semibold">The Orisha Chronicles</span> disponible !</p>
                                  <p className="text-xs text-muted-foreground">par Jelani Adebayo - il y a 5 minutes</p>
                              </div>
                            </Link>
                            <Link href="/artists/2" className="group flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-muted transition-colors">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage src="https://images.unsplash.com/photo-1575264821278-fd76711cd1b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8cG9ydHJhaXQlMjBwZXJzb258ZW58MHx8fHwxNzcxMTg5ODE0fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Amina Diallo" />
                                <AvatarFallback>AD</AvatarFallback>
                              </Avatar>
                              <div>
                                  <p className="text-sm"><span className="font-semibold">Amina Diallo</span> a commencé un nouveau projet : <span className="font-semibold">Cyber-Reines</span>.</p>
                                  <p className="text-xs text-muted-foreground">il y a 2 heures</p>
                              </div>
                            </Link>
                          </div>
                      </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="https://images.unsplash.com/photo-1557053910-d9eadeed1c58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx3b21hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc3MTIyMDQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080" alt="Léa Dubois" />
                            <AvatarFallback>LD</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">Léa Dubois</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              lea.dubois@example.com
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/profile/reader-1"><UserCircle className="mr-2"/>Profil</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="#"><Settings className="mr-2"/>Paramètres</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer"><LogOut className="mr-2"/>Se déconnecter</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </>
               ) : (
                 <>
                   <Button asChild variant="ghost">
                     <Link href="/login">Se connecter</Link>
                   </Button>
                   <Button asChild variant="outline">
                     <Link href="/signup">S'inscrire</Link>
                   </Button>
                   <Button asChild>
                     <Link href="/submit">Publier</Link>
                   </Button>
                 </>
               )}
            </div>
            
            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-foreground/90">
                  <Search className="h-5 w-5" />
                </Button>
                {isLoggedIn && (
                   <Button variant="ghost" size="icon" className="relative text-foreground/90">
                      <Bell className="h-5 w-5" />
                   </Button>
                )}
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
                       {isLoggedIn ? (
                          <>
                             <Button asChild variant="secondary">
                                <Link href="/profile/reader-1" className="flex items-center gap-2 justify-center">
                                    <UserCircle /> Mon Profil
                                </Link>
                             </Button>
                             <Button variant="ghost" onClick={handleLogout} className="w-full">
                                <LogOut /> Se déconnecter
                            </Button>
                          </>
                       ) : (
                          <>
                             <Button asChild>
                               <Link href="/submit">Publier</Link>
                             </Button>
                             <Button asChild variant="outline">
                               <Link href="/signup">S'inscrire</Link>
                             </Button>
                             <Button asChild variant="ghost">
                               <Link href="/login">Se connecter</Link>
                             </Button>
                          </>
                       )}
                    </div>
                  </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
