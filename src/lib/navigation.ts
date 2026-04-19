import { BookOpen, Crown, MessageSquare, Store, Users, Award, PenSquare, Globe, Newspaper, Info, Coins, HelpCircle, Mail, Trophy, UserCircle, Zap, Calendar, Star, LayoutGrid, Languages, BrainCircuit, Layers, Clock, CheckCircle2 } from "lucide-react";

export type NavSubLink = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
};

export type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subLinks?: NavSubLink[];
  isGenreDropdown?: boolean;
  badge?: {
    label: string;
    variant: 'green' | 'orange' | 'emerald' | 'blue';
  };
};

export const navLinks: NavLink[] = [
  { 
    href: "/stories", 
    label: "nav.browse", 
    icon: BookOpen, 
    isGenreDropdown: true,
    subLinks: [
        { href: "/webtoon-hub", label: "nav.webtoons", icon: Layers, color: 'text-primary' },
        { href: "/bd-africaine", label: "nav.comics", icon: Book, color: 'text-emerald-500' },
        { href: "/ongoing", label: "nav.ongoing", icon: Clock, color: 'text-blue-500' },
        { href: "/completed", label: "nav.completed", icon: CheckCircle2, color: 'text-orange-500' },
    ]
  },
  {
    href: "/originals",
    label: "nav.originals",
    icon: Trophy,
    badge: { label: 'nav.live_badge', variant: 'orange' }
  },
  {
    href: "/dashboard/ai-studio",
    label: "nav.ai_studio",
    icon: BrainCircuit,
    badge: { label: 'nav.new_badge', variant: 'emerald' }
  },
  { 
    href: "/rankings", 
    label: "nav.rankings", 
    icon: Crown,
    subLinks: [
      { href: "/rankings?tab=popular", label: "nav.popular" },
      { href: "/rankings?tab=trending", label: "nav.trending" },
      { href: "/rankings?tab=newest", label: "nav.newest" },
    ]
  },
  { 
    href: "/forums", 
    label: "nav.forums", 
    icon: MessageSquare,
    subLinks: [
        { href: "/forums", label: "nav.all_forums" },
        { href: "/mentorship", label: "nav.mentorship" },
        { href: "/dashboard/world-building", label: "nav.world_building" },
        { href: "/blog", label: "nav.blog" },
    ]
  },
  { 
    href: "/pro", 
    label: "nav.pro", 
    icon: Award, 
    badge: { label: 'nav.pro_badge', variant: 'green' },
    subLinks: [
      { href: "/pro", label: "nav.pro_benefits" },
      { href: "/draft", label: "nav.draft_space" },
      { href: "/africoins", label: "nav.africoins_economy" },
      { href: "/submit", label: "nav.submit_work" },
    ]
  },
  { href: "/shop", label: "nav.shop", icon: Store },
];