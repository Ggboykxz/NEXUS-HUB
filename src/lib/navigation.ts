import { BookOpen, Crown, Home, MessageSquare, Store, Users } from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/rankings", label: "Classements", icon: Crown },
  { href: "/artists", label: "Artistes", icon: Users },
  { href: "/forums", label: "Forums", icon: MessageSquare },
  { href: "/shop", label: "Boutique", icon: Store },
];
