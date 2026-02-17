'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ArrowLeft, Bell, UserCircle, LogOut, Settings, ChevronDown, CircleDollarSign, Brush, TrendingUp } from 'lucide-react';
import { navLinks } from '@/lib/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { stories } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [hasMounted, setHasMounted] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimers = useRef<{ [key: string]: any }>({}).current;

  const handleDropdownEnter = (label: string) => {
      if (dropdownTimers[label]) {
          clearTimeout(dropdownTimers[label]);
      }
      setOpenDropdown(label);
  };

  const handleDropdownLeave = (label: string) => {
      dropdownTimers[label] = setTimeout(() => {
          setOpenDropdown(null);
      }, 200);
  };

  const uniqueGenres = [...new Set(stories.map(s => s.genre))];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const handleStorageChange = () => {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      const accountType = localStorage.getItem('accountType');
      const storedUserId = localStorage.getItem('userId');
      setIsLoggedIn(loggedInStatus);
      setIsArtist(loggedInStatus && accountType === 'artist');
      setUserId(loggedInStatus ? storedUserId : null);
    };

    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginStateChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStateChange', handleStorageChange);
    };
  }, [hasMounted]);

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
    localStorage.removeItem('accountType');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('loginStateChange')); 
    router.push('/');
    router.refresh();
  };

  const LoggedInNav = (
    <>
      <Link href="/settings?tab=africoins" className="flex items-center gap-1.5 border-r pr-3 mr-1 hover:bg-muted p-2 rounded-md transition-colors">
         <CircleDollarSign className="h-5 w-5 text-primary" />
         <span className="font-semibold text-sm">150</span>
       </Link>
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
           {userId && <DropdownMenuItem asChild><Link href={isArtist ? `/artists/${userId}` : `/profile/${userId}`}><UserCircle className="mr-2"/>Profil</Link></DropdownMenuItem>}
           {isArtist && (
               <>
                   <DropdownMenuItem asChild><Link href="/dashboard/creations"><Brush className="mr-2"/>Mon Atelier</Link></DropdownMenuItem>
                   <DropdownMenuItem asChild><Link href="/dashboard/stats"><TrendingUp className="mr-2"/>Statistiques</Link></DropdownMenuItem>
               </>
           )}
           <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2"/>Paramètres</Link></DropdownMenuItem>
           <DropdownMenuSeparator />
           <DropdownMenuItem onClick={handleLogout} className="cursor-pointer"><LogOut className="mr-2"/>Se déconnecter</DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
    </>
  );

  const LoggedOutNav = (
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
  );

    const MobileLoggedInNav = (
    <>
      {isArtist ? (
          <>
              <Button asChild variant="secondary">
                  <Link href="/dashboard/creations" className="flex items-center gap-2 justify-center">
                      <Brush /> Mon Atelier
                  </Link>
              </Button>
              <Button asChild variant="ghost">
                  <Link href="/dashboard/stats" className="flex items-center gap-2 justify-center">
                      <TrendingUp /> Statistiques
                  </Link>
              </Button>
          </>
      ) : (
          <Button asChild variant="secondary">
              {userId && <Link href={`/profile/${userId}`} className="flex items-center gap-2 justify-center">
                  <UserCircle /> Mon Profil
              </Link>}
          </Button>
      )}
       <Button asChild variant="ghost">
          <Link href="/settings" className="flex items-center gap-2 justify-center">
              <Settings /> Paramètres
          </Link>
       </Button>
       <Button variant="outline" onClick={handleLogout} className="w-full">
          <LogOut className="mr-2"/> Se déconnecter
      </Button>
    </>
  );

  const MobileLoggedOutNav = (
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
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className={cn("container flex max-w-7xl items-center px-6 lg:px-12 transition-all duration-300", isScrolled ? "h-16" : "h-20")}>
        <div className={cn("w-full items-center justify-between", isSearchOpen ? 'hidden' : 'flex')}>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl tracking-tight text-foreground">NexusHub<span className="text-primary">.</span></span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide text-foreground/80 dark:text-stone-300">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              if (link.isGenreDropdown || (link.subLinks && link.subLinks.length > 0)) {
                return (
                  <DropdownMenu key={link.label} open={openDropdown === link.label} onOpenChange={(isOpen) => setOpenDropdown(isOpen ? link.label : null)}>
                    <div onMouseEnter={() => handleDropdownEnter(link.label)} onMouseLeave={() => handleDropdownLeave(link.label)} className="flex items-center">
                      <DropdownMenuTrigger
                        className={cn(
                          'flex items-center gap-1 hover:text-primary focus:text-primary focus:outline-none transition-colors duration-300',
                          '[&>svg]:transition-transform [&>svg]:duration-200 [&[data-state=open]>svg]:rotate-180',
                          isActive ? 'text-foreground dark:text-white font-semibold' : ''
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {link.label}
                          {link.badge && (
                            <span className={cn(
                              'h-2 w-2 rounded-full',
                              link.badge.variant === 'green' && 'bg-green-500',
                              link.badge.variant === 'orange' && 'bg-orange-500',
                            )}></span>
                          )}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {link.isGenreDropdown && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/stories">Toutes les œuvres</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Genres</DropdownMenuLabel>
                            {uniqueGenres.map((genre) => (
                              <DropdownMenuItem key={genre} asChild>
                                <Link href={`/stories?genre=${genre}`}>{genre}</Link>
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                        {link.subLinks && link.subLinks.map((subLink) => (
                            <DropdownMenuItem key={subLink.href} asChild>
                              <Link href={subLink.href}>{subLink.label}</Link>
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </div>
                  </DropdownMenu>
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 hover:text-primary transition-colors duration-300',
                    isActive ? 'text-foreground dark:text-white font-semibold' : ''
                  )}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={cn(
                        'h-2 w-2 rounded-full',
                        link.badge.variant === 'green' && 'bg-green-500',
                        link.badge.variant === 'orange' && 'bg-orange-500',
                    )}></span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 md:flex">
                 <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-foreground/90">
                      <Search className="h-5 w-5" />
                  </Button>
                 
                <div className={cn('flex items-center gap-2', (hasMounted && isLoggedIn) ? 'hidden' : 'flex')}>
                    {LoggedOutNav}
                </div>
                <div className={cn('flex items-center gap-2', (hasMounted && isLoggedIn) ? 'flex' : 'hidden')}>
                    {LoggedInNav}
                </div>
              </div>
              
              <div className="md:hidden flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-foreground/90">
                      <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className={cn('relative text-foreground/90', !(hasMounted && isLoggedIn) && 'hidden')}>
                      <Bell className="h-5 w-5" />
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
                            <nav className="flex flex-col space-y-2 px-4">
                                {navLinks.map((link) => {
                                  if (link.isGenreDropdown || (link.subLinks && link.subLinks.length > 0)) {
                                    return (
                                      <Accordion type="single" collapsible key={link.label} className="w-full">
                                        <AccordionItem value={link.label} className="border-b-0">
                                          <AccordionTrigger className="p-0 text-lg font-medium hover:no-underline flex justify-between w-full">
                                            <span className="flex items-center gap-2">
                                              {link.label}
                                              {link.badge && (
                                                <span className={cn(
                                                  'h-2 w-2 rounded-full',
                                                  link.badge.variant === 'green' && 'bg-green-500',
                                                  link.badge.variant === 'orange' && 'bg-orange-500',
                                                )}></span>
                                              )}
                                            </span>
                                          </AccordionTrigger>
                                          <AccordionContent className="pt-2 pl-4">
                                            <div className="flex flex-col space-y-2">
                                                {link.isGenreDropdown && (
                                                    <>
                                                        <Link href="/stories" className="text-base font-medium text-muted-foreground hover:text-foreground">
                                                            Toutes les œuvres
                                                        </Link>
                                                        {uniqueGenres.map(genre => (
                                                            <Link key={genre} href={`/stories?genre=${genre}`} className="text-base font-medium text-muted-foreground hover:text-foreground">
                                                                {genre}
                                                            </Link>
                                                        ))}
                                                    </>
                                                )}
                                                {link.subLinks && link.subLinks.map((subLink) => (
                                                    <Link key={subLink.href} href={subLink.href} className="text-base font-medium text-muted-foreground hover:text-foreground">
                                                        {subLink.label}
                                                    </Link>
                                                ))}
                                            </div>
                                          </AccordionContent>
                                        </AccordionItem>
                                      </Accordion>
                                    );
                                  }
                                  return (
                                    <Link key={link.label} href={link.href} className="text-lg font-medium flex items-center gap-2">
                                      <span>{link.label}</span>
                                      {link.badge && (
                                        <span className={cn(
                                          'h-2 w-2 rounded-full',
                                          link.badge.variant === 'green' && 'bg-green-500',
                                          link.badge.variant === 'orange' && 'bg-orange-500',
                                        )}></span>
                                      )}
                                    </Link>
                                  );
                                })}
                            </nav>
                        </div>
                        <div className="mt-auto flex flex-col gap-2 border-t p-4">
                            <div className={cn("flex flex-col gap-2", hasMounted && isLoggedIn ? "hidden" : "flex")}>
                                {MobileLoggedOutNav}
                            </div>
                            <div className={cn("flex flex-col gap-2", hasMounted && isLoggedIn ? "flex" : "hidden")}>
                                {MobileLoggedInNav}
                            </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                </div>
          </div>
        </div>

        <div className={cn("w-full items-center gap-2 animate-in fade-in-0", isSearchOpen ? 'flex' : 'hidden')}>
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
