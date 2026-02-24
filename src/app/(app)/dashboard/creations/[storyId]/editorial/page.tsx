'use client';

import { useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, Sparkles, Wand2, Loader2, AlertTriangle, 
  CheckCircle2, ArrowLeft, MessageSquare, History,
  Flame, Zap, Languages, BrainCircuit
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { editorialAction } from '@/ai/flows/editorial-ai-flow';
import { cn } from '@/lib/utils';

export default function EditorialStudioPage(props: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(props.params);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [activeTool, setActiveTab] = useState<'rhythm' | 'cliche' | 'dialogue' | 'culture'>('rhythm');
  const [result, setResult] = useState<any>(null);

  const tools = [
    { id: 'rhythm', label: 'Rythme', icon: History, desc: 'Longueurs & Intrigues' },
    { id: 'cliche', label: 'Clichés', icon: Zap, desc: 'Tropes & Originalité' },
    { id: 'dialogue', label: 'Dialogues', icon: MessageSquare, desc: 'Naturel & Impact' },
    { id: 'culture', label: 'Culture', icon: Flame, desc: 'Authenticité Africaine' },
  ];

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const output = await editorialAction({
        type: activeTool,
        genre: 'Mythologie', // Simulation - À récupérer depuis la story
        content: content,
        context: "Une série épique se déroulant dans le futur du Gabon."
      });
      setResult(output);
      toast({ title: "Analyse terminée", description: "L'IA a généré ses recommandations." });
    } catch (e) {
      toast({ title: "Erreur IA", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div className="space-y-2">
          <Link href={`/dashboard/creations/${storyId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-2">
            <ArrowLeft className="h-4 w-4" /> Retour à l'Atelier
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-display tracking-tight">Atelier Éditorial AI</h1>
          </div>
          <p className="text-muted-foreground text-lg italic font-light">"Affinez votre narration avec l'œil expert de l'IA Nexus."</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-12">
        <div className="space-y-8">
          {/* TOOL SELECTOR */}
          <div className="flex flex-wrap gap-3 bg-muted/50 p-2 rounded-[2rem] border border-border/50">
            {tools.map((tool) => (
              <Button 
                key={tool.id}
                onClick={() => { setActiveTab(tool.id as any); setResult(null); }}
                variant={activeTool === tool.id ? 'default' : 'ghost'}
                className={cn(
                  "rounded-2xl gap-3 h-14 px-6 flex-1 lg:flex-none transition-all",
                  activeTool === tool.id && "bg-white text-black shadow-xl"
                )}
              >
                <tool.icon className="h-5 w-5" />
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black uppercase leading-tight">{tool.label}</p>
                  <p className="text-[8px] opacity-60 leading-tight">{tool.desc}</p>
                </div>
              </Button>
            ))}
          </div>

          <Card className="bg-card/50 border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-display font-bold">Zone de Rédaction</CardTitle>
              <CardDescription>Collez votre script ou le texte de votre chapitre ci-dessous.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Il était une fois dans les sables du temps..."
                className="min-h-[250px] bg-background/50 border-none rounded-[2rem] p-8 text-lg font-light italic focus-visible:ring-primary"
              />
              <Button 
                onClick={handleAnalyze}
                disabled={loading || !content.trim()}
                className="w-full h-16 rounded-2xl bg-primary text-black font-black text-xl gold-shimmer shadow-2xl shadow-primary/20"
              >
                {loading ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Analyse éditoriale...</> : <><Sparkles className="mr-3 h-6 w-6" /> Lancer l'Analyse</>}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
              <Card className="bg-stone-900 border-primary/20 rounded-[2.5rem] p-8 text-white">
                <h3 className="text-xl font-display font-black text-primary mb-4 flex items-center gap-2">
                  <Wand2 className="h-5 w-5" /> Diagnostic de l'Éditeur
                </h3>
                <p className="text-stone-300 leading-relaxed italic mb-8 border-l-2 border-primary/30 pl-6">
                  {result.analysis}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-emerald-500 tracking-widest">Suggestions Concrètes</h4>
                    <ul className="space-y-3">
                      {result.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-stone-400">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-rose-500 tracking-widest">Points de Vigilance</h4>
                      <ul className="space-y-3">
                        {result.warnings.map((w: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-stone-400">
                            <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" /> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <Card className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8">
            <h4 className="font-bold text-primary mb-4">Le Saviez-vous ?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "L'IA de NexusHub ne remplace pas votre voix unique. Elle agit comme un miroir pour vous aider à voir ce que vos yeux, fatigués par la création, pourraient manquer."
            </p>
          </Card>

          <Card className="bg-stone-950 border-white/5 rounded-[2.5rem] p-8 text-center space-y-4">
            <div className="bg-emerald-500/10 p-3 rounded-full w-fit mx-auto">
              <Languages className="h-6 w-6 text-emerald-500" />
            </div>
            <h4 className="text-sm font-bold text-white">Prêt pour l'export ?</h4>
            <p className="text-[10px] text-stone-500">Une fois votre texte affiné, passez au Studio de Traduction pour toucher une audience mondiale.</p>
            <Button variant="outline" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest border-white/10 text-white">Ouvrir Traduction</Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
