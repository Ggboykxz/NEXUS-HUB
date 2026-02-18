import { BookOpen, Crown, MessageSquare, Store, Users, Award, PenSquare, Globe } from "lucide-react";

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
  badge?: {
    label: string;
    variant: 'green' | 'orange';
  };
};

export const navLinks: NavLink[] = [
  { 
    href: "/stories", 
    label: "Parcourir", 
    icon: BookOpen, 
    isGenreDropdown: true,
    subLinks: [
        { href: "/webtoons", label: "Webtoons" },
        { href: "/comics", label: "Bandes Dessinées" },
        { href: "/ongoing", label: "Séries en Cours" },
        { href: "/completed", label: "Séries Terminées" },
    ]
  },
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
  { 
    href: "/artists", 
    label: "Artistes", 
    icon: Users,
    subLinks: [
        { href: "/artists", label: "Tous les artistes" },
        { href: "/mentorship", label: "Programme de Mentorat" },
        { href: "/dashboard/world-building", label: "Outils de World Building" },
    ]
  },
  { href: "/forums", label: "Forums", icon: MessageSquare },
  { href: "/shop", label: "Boutique", icon: Store },
  { href: "/submit", label: "NexusHub Pro", icon: Award, badge: { label: 'Pro', variant: 'green' } },
  { href: "/submit", label: "NexusHub Draft", icon: PenSquare, badge: { label: 'Draft', variant: 'orange' } },
];
