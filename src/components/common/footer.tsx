'use client';

import Link from 'next/link';
import { 
  BookOpen, Heart, ShieldCheck, Send, Smartphone, 
  Globe, Github, Twitter, Instagram, Facebook,
  Award, Zap, Flame, LayoutGrid, MessageSquare,
  ShoppingCart, HelpCircle, Mail, MapPin, Radio,
  Brush
} from 'lucide-react';
import { useTranslation } from '../providers/language-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/logo';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-stone-950 border-t border-white/5 pt-24 pb-12 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand and Description */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo className="h-16 w-auto transition-transform group-hover:scale-110" />
            </Link>
            
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm italic font-light">
              "{t('footer.desc')}"
            </p>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-stone-500 tracking-[0.3em]">Restez au cœur des légendes</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="votre@email.com" 
                  className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary transition-all text-white" 
                />
                <Button size="icon" className="h-12 w-12 rounded-xl bg-primary text-black hover:bg-primary/90">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="h-3.5 w-3.5 text-primary" /> {t('footer.library')}
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Tout Parcourir", href: "/stories" },
                  { label: "Webtoon Hub", href: "/webtoon-hub" },
                  { label: "BD Africaine", href: "/bd-africaine" },
                  { label: "Originals", href: "/originals" },
                  { label: "Classements", href: "/rankings" },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-stone-500 hover:text-primary text-xs transition-colors font-medium">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Brush className="h-3.5 w-3.5 text-emerald-500" /> {t('footer.creation')}
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Publier une œuvre", href: "/submit" },
                  { label: "Espace Draft", href: "/draft" },
                  { label: "Programme Pro", href: "/pro" },
                  { label: "Mentorat", href: "/mentorship" },
                  { label: "AI Studio", href: "/dashboard/ai-studio" },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-stone-500 hover:text-primary text-xs transition-colors font-medium">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-blue-500" /> {t('footer.community')}
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Forums", href: "/forums" },
                  { label: "Boutique", href: "/shop" },
                  { label: "Clubs de Lecture", href: "/clubs" },
                  { label: "Événements Live", href: "/events" },
                  { label: "Blog", href: "/blog" },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-stone-500 hover:text-primary text-xs transition-colors font-medium">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-amber-500" /> {t('footer.support')}
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "FAQ", href: "/faq" },
                  { label: "Contact", href: "/contact" },
                  { label: "À propos", href: "/about" },
                  { label: "Confidentialité", href: "/legal/privacy" },
                  { label: "Conditions", href: "/legal/terms" },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-stone-500 hover:text-primary text-xs transition-colors font-medium">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <Separator className="bg-white/5 mb-10" />
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-4">
              <Link href="#" className="text-stone-600 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-stone-600 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="text-stone-600 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></Link>
            </div>
            
            <div className="h-4 w-px bg-white/5 hidden md:block" />
            
            <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest text-center">
              &copy; 2026 NexusHub Digital &bull; {t('footer.rights')}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest whitespace-nowrap">Hub Status: Operational</span>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-stone-500 font-medium italic">
              {t('footer.made_with')} <Heart className="h-3 w-3 text-rose-600 fill-rose-600 animate-pulse" /> {t('footer.in_gabon')} 🇬🇦
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
