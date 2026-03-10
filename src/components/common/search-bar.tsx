'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mic, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '../providers/language-provider';
import { useToast } from '@/hooks/use-toast';

interface SearchBarProps {
  onClose: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      onClose();
      setSearchQuery('');
    }
  };

  const handleVoiceSearch = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({ title: "Not supported", description: "Your browser does not support voice search.", variant: "destructive" });
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        router.push(`/search?q=${encodeURIComponent(transcript)}`);
        onClose();
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  return (
    <div className="w-full flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10">
        <ArrowLeft className="h-5 w-5 text-primary" />
      </Button>
      <form onSubmit={handleSearchSubmit} className="flex-1 relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('nav.search')}
          className="h-11 w-full pl-12 pr-12 rounded-full bg-white/5 border-white/10 text-white focus:border-primary shadow-2xl transition-all font-light"
          autoFocus
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Button
          type="button"
          onClick={handleVoiceSearch}
          variant="ghost"
          size="icon"
          className={cn("absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full", isListening && "text-red-500 animate-pulse")}
        >
          <Mic className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
