import { BookOpen, Crown, MessageSquare, Store, Users } from "lucide-react";

export type NavSubLink = {
  href: string;
  label: string;
};

export type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subLinks?: NavSubLink[];
  isGenreDropdown?: boolean;
};

export const navLinks: NavLink[] = [
  { href: "/stories", label: "Parcourir", icon: BookOpen, isGenreDropdown: true },
  { 
    href: "/rankings", 
    label: "Classements", 
    icon: Crown,
    subLinks: [
      { href: "/rankings?tab=popular", label: "Populaires" },
      { href: "/rankings?tab=trending", label: "Tendance" },
      { href: "/rankings?tab=newest", label: "Nouveautés" },
    ]
  },
  { href: "/artists", label: "Artistes", icon: Users },
  { href: "/forums", label: "Forums", icon: MessageSquare },
  { href: "/shop", label: "Boutique", icon: Store },
];
