'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { type NavLink } from '@/lib/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../providers/language-provider';
import { useGenres } from '../providers/genres-provider';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { MegaMenu } from './mega-menu';

export function NavLinkRenderer({ link, className }: { link: NavLink, className?: string }) {
  const { t } = useTranslation();
  const { genres: uniqueGenres } = useGenres();
  const pathname = usePathname();
  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
  const isBrowse = link.label === "Parcourir";

  const getNavLabel = (link: NavLink) => {
    const keyMap: Record<string, string> = {
      "Parcourir": "nav.browse",
      "Classements": "nav.rankings",
      "Forums": "nav.forums",
      "Boutique": "nav.shop",
      "Originals": "nav.originals",
      "NexusHub Pro": "nav.pro"
    };
    return t(keyMap[link.label] || link.label);
  };

  const label = getNavLabel(link);

  if (isBrowse || link.isGenreDropdown || (link.subLinks && link.subLinks.length > 0)) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'flex items-center gap-1 hover:text-primary focus:text-primary transition-colors text-[11px] uppercase font-black tracking-widest outline-none',
            isActive ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          <span>{label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className={cn(
            "p-0 rounded-[2rem] border-primary/10 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300",
            isBrowse ? "w-[600px]" : "w-56 p-2"
          )}
        >
          {isBrowse ? (
            <MegaMenu />
          ) : (
            <>
              {link.isGenreDropdown && (
                <>
                  <DropdownMenuItem asChild className="rounded-xl h-10">
                    <Link href="/stories" className="flex items-center gap-3 font-bold"><LayoutGrid className="h-4 w-4 text-primary" />{label} Tout</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/5" />
                  <DropdownMenuLabel className="text-[9px] uppercase font-black text-muted-foreground px-3 pt-3 pb-1 tracking-[0.2em]">Genres Populaires</DropdownMenuLabel>
                  <div className="grid grid-cols-1 gap-0.5">
                    {uniqueGenres.slice(0, 8).map((genre) => (
                      <DropdownMenuItem key={`header-genre-${genre.slug}`} asChild className="rounded-xl h-10">
                        <Link href={`/genre/${genre.slug}`} className="font-medium">{genre.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </>
              )}
              {link.subLinks?.map((sub) => (
                <DropdownMenuItem key={`sublink-${sub.href}`} asChild className="rounded-xl h-10">
                  <Link href={sub.href} className="font-medium">{sub.label}</Link>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href={link.href} className={cn('flex items-center gap-2 hover:text-primary transition-colors text-[11px] uppercase font-black tracking-widest', isActive ? 'text-foreground' : 'text-foreground/60', className)}>
      <span>{label}</span>
      {link.badge && <Badge variant={link.badge.variant === 'green' ? 'default' : 'outline'} className={cn("text-[8px] px-1 py-0 h-3.5", link.badge.variant === 'green' ? "bg-emerald-500 border-none shadow-emerald-500/20" : "border-orange-500/50 text-orange-400")}>{link.badge.label}</Badge>}
    </Link>
  );
}