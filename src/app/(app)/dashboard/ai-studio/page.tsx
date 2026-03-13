'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, Bot, PenSquare, Film, Mic, Palette, Users, Code, Wand2, BrainCircuit, Loader2, ClipboardCopy, Check, Download, History, X, Trash2, Save, Share2
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateContent } from '@/lib/actions/ai-actions';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const aiTools = {
  scenariste: { name: 'Scénariste IA', icon: PenSquare, prompt: 'Développer un synopsis de 500 mots pour une bande dessinée afrofuturiste se déroulant à Neo-Lagos en 2242, impliquant un jeune héros qui découvre un artefact ancien.', bgColor: 'bg-sky-500/10', textColor: 'text-sky-400', borderColor: 'border-sky-500/20' },
  dialoguiste: { name: 'Dialoguiste IA', icon: Mic, prompt: 'Écrire un dialogue percutant entre un roi vieillissant et sa fille ambitieuse qui veut réformer le royaume. Inclure des tensions sous-jacentes et des non-dits.', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/20' },
  concept: { name: 'Concept Artist IA', icon: Palette, prompt: 'Générer une description visuelle détaillée pour un personnage de type "guerrier nomade du Sahel" avec des éléments technologiques intégrés à sa tenue traditionnelle.', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400', borderColor: 'border-amber-500/20' },
  univers: { name: 'Créateur d\'Univers IA', icon: Film, prompt: 'Décrire trois factions politiques et leurs idéologies dans un empire subsaharien fictif qui a maîtrisé la manipulation de l\'énergie solaire.', bgColor: 'bg-rose-500/10', textColor: 'text-rose-400', borderColor: 'border-rose-500/20' },
};

type AiTool = keyof typeof aiTools;

export default function AiStudioPage() {
  const [activeTab, setActiveTab] = useState<AiTool>('scenariste');
  const [promptText, setPromptText] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setPromptText(aiTools[activeTab].prompt);
    setOutput('');
  }, [activeTab]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('nexus-ai-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse AI history from localStorage", e);
    }
  }, []);

  const updateHistory = (newEntry: any) => {
    setHistory(prev => {
      const newHistory = [newEntry, ...prev].slice(0, 20);
      try {
        localStorage.setItem('nexus-ai-history', JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save AI history to localStorage", e);
      }
      return newHistory;
    });
  };

  const handleGenerate = async () => {
    if (!promptText) return;
    setIsLoading(true);
    setOutput('');
    try {
      const result = await generateContent(activeTab, promptText);
      setOutput(result);
      updateHistory({ 
        tool: activeTab, 
        prompt: promptText, 
        result: result, 
        timestamp: new Date() 
      });
    } catch (error: any) {
      setOutput(`## Erreur de Génération\n\nL\'API a retourné une erreur. Cela peut être dû à une surcharge du service ou à des filtres de sécurité. Veuillez réessayer.\n\n**Détail de l\'erreur:**\n\`\`\`\n${error.message || 'Unknown error'}\n\`\`\``);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    toast({ title: "Copié dans le presse-papier !" });
  };

  const handleSaveToArchives = async () => {
    if (!currentUser) {
      toast({ title: "Connexion requise", description: "Vous devez être connecté pour sauvegarder.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'aiGenerations'), {
        tool: activeTab,
        prompt: promptText,
        result: output,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Sauvegardé !", description: "Votre génération a été enregistrée dans vos archives." });
    } catch (error) {
      console.error("Failed to save generation:", error);
      toast({ title: "Erreur de sauvegarde", variant: "destructive" });
    }
  };

  const handleShare = () => {
    const shareLink = `nexushub.app/shared/ai/${Date.now()}`;
    navigator.clipboard.writeText(shareLink);
    toast({ title: "Lien de partage copié !" });
  };

  const handleRestoreFromHistory = (item: any) => {
    setActiveTab(item.tool);
    setPromptText(item.prompt);
    setOutput(item.result);
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nexus-ai-history');
    toast({ title: "Historique effacé", description: "Votre historique de générations a été vidé." });
  };

  const SidebarButton = ({ tool, ...props }: { tool: AiTool } & React.ComponentProps<typeof Button>) => (
    <Button
      variant={activeTab === tool ? 'secondary' : 'ghost'}
      onClick={() => setActiveTab(tool)}
      className={cn(
        "w-full justify-start h-12 rounded-xl text-xs font-bold gap-3 transition-all",
        activeTab === tool && `${aiTools[tool].textColor} ${aiTools[tool].bgColor} hover:${aiTools[tool].bgColor}`
      )}
      {...props}
    >
      {React.createElement(aiTools[tool].icon, { className: "h-5 w-5" })}
      {aiTools[tool].name}
    </Button>
  );

  return (
    <>
    <div className="h-full flex flex-col md:flex-row bg-background">
      {/* --- SIDEBAR --- */}
      <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-stone-900/50 border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 w-fit">
                <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h1 className="font-display font-black text-2xl text-white tracking-tighter">AI Studio</h1>
                <p className="text-[10px] uppercase font-black tracking-widest text-primary">v2.1 Genkit</p>
            </div>
          </div>
          <p className="text-xs text-stone-400 italic font-light">Votre compagnon créatif. Générez des idées, des dialogues et des concepts pour donner vie à vos récits.</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-stone-500 pl-2">Outils</h2>
          {Object.keys(aiTools).map(key => <SidebarButton key={key} tool={key as AiTool} />)}
        </div>
        
        <div className="mt-auto">
            <Button onClick={() => setIsHistoryOpen(true)} variant="outline" className="w-full h-12 rounded-xl text-xs font-bold gap-3 border-dashed border-white/10 hover:border-solid hover:bg-white/5">
                <History className="h-5 w-5" /> Historique des générations
            </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col p-6 min-h-0">
        <div className="flex flex-col items-center justify-center p-6 rounded-[2rem] text-center flex-shrink-0 border-2 border-dashed border-white/5 mb-6" style={{ borderColor: aiTools[activeTab].borderColor.split(' ')[0].replace('border-','') }}>
          <h2 className={cn("text-2xl font-display font-black flex items-center gap-3", aiTools[activeTab].textColor)}>
            {React.createElement(aiTools[activeTab].icon, { className: "h-6 w-6" })} {aiTools[activeTab].name}
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* --- PROMPT --- */}
          <div className="flex flex-col gap-4 min-h-0">
            <Textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Décrivez votre idée..."
              className="flex-1 w-full bg-stone-900/70 border-white/10 rounded-2xl p-6 text-sm resize-none focus:border-primary/50 transition-colors"
            />
            <Button onClick={handleGenerate} disabled={isLoading} className="h-14 rounded-2xl font-black text-base gold-shimmer shadow-lg shadow-primary/20">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />} Générer
            </Button>
          </div>

          {/* --- OUTPUT --- */}
          <div className="min-h-0 relative flex flex-col gap-4">
            {output && !isLoading && (
                <div className="flex-shrink-0 bg-stone-900/70 border border-white/10 rounded-full p-1 flex items-center justify-center gap-2 max-w-min mx-auto">
                    <Button onClick={handleCopyToClipboard} variant="ghost" size="sm" className="rounded-full hover:bg-white/5 h-9 px-4 text-xs font-bold gap-2">{hasCopied ? <Check className='h-4 w-4 text-emerald-400'/> : <ClipboardCopy className="h-4 w-4"/>}Copier</Button>
                    <Button onClick={handleSaveToArchives} variant="ghost" size="sm" className="rounded-full hover:bg-white/5 h-9 px-4 text-xs font-bold gap-2"><Save className="h-4 w-4"/>Sauvegarder</Button>
                    <Button onClick={handleShare} variant="ghost" size="sm" className="rounded-full hover:bg-white/5 h-9 px-4 text-xs font-bold gap-2"><Share2 className="h-4 w-4"/>Partager</Button>
                </div>
            )}
            <ScrollArea className="h-full w-full bg-stone-900/70 border-white/10 rounded-2xl">
                <article className="prose prose-invert prose-sm p-6 max-w-none prose-p:text-stone-300 prose-headings:text-primary prose-headings:font-display prose-strong:text-white">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full p-10 space-y-4">
                      <Bot className="h-10 w-10 text-primary animate-pulse" />
                      <p className="text-xs text-stone-500 font-black uppercase tracking-widest">NexusIA réfléchit...</p>
                    </div>
                  ) : output ? (
                     <Markdown remarkPlugins={[remarkGfm]}>{output}</Markdown>
                  ) : (
                    <div className="text-center p-10 space-y-4 text-stone-600">
                      <Bot className="h-10 w-10 mx-auto" />
                      <p className="font-bold italic">Le résultat de votre requête apparaîtra ici.</p>
                    </div>
                  )}
                </article>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
    
    {/* --- HISTORY SHEET --- */}
     <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="bg-stone-950 border-l-white/5 text-white p-0 flex flex-col w-full sm:max-w-lg">
          <SheetHeader className="p-6 pb-4 border-b border-white/10">
            <SheetTitle className="text-xl font-display font-black text-white flex items-center gap-3">
              <History className="h-5 w-5 text-primary" /> Historique des Générations
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            {history.length > 0 ? (
                <div className="p-6 space-y-4">
                {history.map((item, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-dashed", aiTools[item.tool as AiTool]?.borderColor, aiTools[item.tool as AiTool]?.textColor)}>{aiTools[item.tool as AiTool]?.name}</Badge>
                            <span className="text-[10px] text-stone-500 font-mono">{format(new Date(item.timestamp), 'dd/MM HH:mm')}</span>
                        </div>
                        <p className="text-xs text-stone-400 italic line-clamp-2">“{item.prompt}”</p>
                        <Button onClick={() => handleRestoreFromHistory(item)} size="sm" variant="ghost" className="w-full h-9 text-[10px] font-black tracking-widest uppercase bg-white/5 hover:bg-white/10">
                            Recharger cette génération
                        </Button>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center p-12 text-stone-600 space-y-4">
                    <History className="h-10 w-10 mx-auto" />
                    <p className="font-bold italic text-sm">Votre historique est vide.</p>
                    <p className="text-xs">Les générations que vous effectuerez apparaîtront ici.</p>
                </div>
            )}
          </ScrollArea>
          {history.length > 0 && (
            <SheetFooter className="p-6 pt-4 border-t border-white/10">
                <Button onClick={handleClearHistory} variant="destructive" className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest gap-2">
                    <Trash2 className="h-4 w-4" /> Effacer l\'historique
                </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
