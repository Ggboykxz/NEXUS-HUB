'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Palette, Users, Zap, BrainCircuit, HeartPulse, 
  MessageSquareQuote, Brush, Layout, Waves, Wind, ShieldCheck,
  ChevronRight, Loader2, Save, Send, Info, Wand2, AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { aiStudioAction } from '@/ai/flows/ai-studio-flow';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AIStudioPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('storyboard');
  const [promptText, setPromptText] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleRunAi = async () => {
    if (!promptText.trim()) return;
    setLoading(true);
    setResult(null);

    // MODE DÉMO (Pour le développement et les tests sans quota)
    if (process.env.NEXT_PUBLIC_AI_DEMO_MODE === 'true') {
      await new Promise(r => setTimeout(r, 1500)); // Simuler latence
      
      const mocks: Record<string, any> = {
        storyboard: { 
          result: "Case 1: Gros plan sur le regard déterminé de l'héroïne. Case 2: Elle s'élance à travers le marché de Libreville en évitant les étals de Bogolan. Case 3: Plan large, elle fait face à l'ombre colossale de l'Orisha invoqué.",
          visualHints: ["Utilisez des lignes de vitesse cinétiques", "Accentuez les contrastes chaud/froid"]
        },
        character: { 
          result: "Traits immuables : Yeux ambrés luisants, cicatrice en forme de fougère sur l'avant-bras gauche, porte toujours un pendentif protecteur en bronze.",
          recommendations: ["Gardez la hauteur du bandeau constante"]
        },
        'color-palette': { 
          result: "Palette 'Héritage Royal' : #8B4513 (Terre Cuite), #DAA520 (Or Ashanti), #2E8B57 (Vert Émeraude), #FF4500 (Ocre Brûlé), #000000 (Noir Intense).",
          visualHints: ["Idéal pour les scènes de palais ou de cérémonie"]
        },
        onomatopoeia: { 
          result: "BOUM-KRAK ! (Impact tellurique), SHHH-VUIIT ! (Déplacement mystique), KLO-KLOP (Bruit de sabots sur la latérite).",
          visualHints: ["Utilisez une typographie angulaire et épaisse"]
        },
        burnout: { 
          result: "Votre niveau de stress créatif semble élevé. La narration risque d'en pâtir.",
          recommendations: [
            "Accordez-vous une pause de 15 minutes loin des écrans.",
            "Réalisez une esquisse rapide sur papier physique pour réinitialiser votre perception.",
            "Hydratez-vous et pratiquez 3 cycles de respiration profonde."
          ]
        },
      };

      setResult(mocks[activeTab] || { result: "Analyse simulée en mode démo. Connectez une clé API pour les résultats réels." });
      setLoading(false);
      toast({ title: "Mode Démo Actif", description: "Résultat généré instantanément." });
      return;
    }

    try {
      const output = await aiStudioAction({
        toolType: activeTab as any,
        context: promptText,
        content: promptText
      });
      setResult(output);
      toast({ title: "Génération réussie !", description: "L'IA a terminé son analyse." });
    } catch (e: any) {
      console.error("AI Studio Error:", e);
      const errorMessage = e.message || "";
      
      // Gestion spécifique des erreurs de maintenance/quota
      if (errorMessage.toLowerCase().includes('api key') || 
          errorMessage.toLowerCase().includes('quota') || 
          errorMessage.toLowerCase().includes('expired')) {
        toast({ 
          title: "Service en maintenance", 
          description: "Le Studio IA est momentanément indisponible. Réessayez dans quelques instants.",
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Erreur de connexion", 
          description: "Le portail vers l'IA a rencontré une turbulence. Veuillez réessayer.", 
          variant: "destructive" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    { id: 'storyboard', icon: Layout, title: 'Storyboard AI', desc: 'Transformez votre script en esquisses.', color: 'text-primary' },
    { id: 'character', icon: Users, title: 'Consistance Perso', desc: 'Maintenez vos héros cohérents.', color: 'text-emerald-500' },
    { id: 'color-palette', icon: Palette, title: 'Palettes Textiles', desc: 'Kente, Bogolan & Ankara colors.', color: 'text-amber-500' },
    { id: 'onomatopoeia', icon: Waves, title: 'SFX Culturels', desc: 'Onomatopées visuelles stylisées.', color: 'text-cyan-500' },
    { id: 'burnout', icon: HeartPulse, title: 'Anti-Burnout', desc: 'Préservez votre énergie créative.', color: 'text-rose-500' },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12">
      {/* 1. HERO STUDIO */}
      <header className="mb-16 relative p-12 rounded-[3rem] bg-stone-950 border border-primary/10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-6 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">NexusHub AI Studio</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none">
              Libérez votre <br/><span className="gold-resplendant">Créativité</span>
            </h1>
            <p className="text-lg text-stone-400 font-light italic max-w-xl">
              "L'intelligence artificielle au service de l'authenticité africaine. Des outils conçus pour accélérer votre production sans sacrifier votre vision."
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-primary">5+</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Outils Experts</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center space-y-1">
              <p className="text-3xl font-black text-emerald-500">PRO</p>
              <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Inclusion</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr,400px] gap-12">
        <div className="space-y-10">
          {/* 2. TABS SELECTOR */}
          <div className="flex flex-wrap gap-3 bg-muted/50 p-2 rounded-[2rem] border border-border/50">
            {tools.map((tool) => (
              <Button 
                key={tool.id}
                onClick={() => { setActiveTab(tool.id); setResult(null); }}
                variant={activeTab === tool.id ? 'default' : 'ghost'}
                className={cn(
                  "rounded-2xl gap-3 h-14 px-6 flex-1 lg:flex-none transition-all",
                  activeTab === tool.id && "bg-white text-black shadow-xl"
                )}
              >
                <tool.icon className={cn("h-5 w-5", activeTab === tool.id ? "text-stone-900" : tool.color)} />
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black uppercase leading-tight">{tool.title}</p>
                  <p className="text-[8px] opacity-60 leading-tight">{tool.desc}</p>
                </div>
              </Button>
            ))}
          </div>

          {/* 3. WORKSPACE */}
          <Card className="bg-card/50 border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black text-primary border-primary/20 bg-primary/5">Zone de Travail AI</Badge>
                <div className="flex items-center gap-2 text-[8px] font-bold text-stone-500 uppercase">
                  <ShieldCheck className="h-3 w-3" /> Genkit Security active
                </div>
              </div>
              <CardTitle className="text-3xl font-display font-bold">
                {tools.find(t => t.id === activeTab)?.title}
              </CardTitle>
              <CardDescription className="italic">"{tools.find(t => t.id === activeTab)?.desc}"</CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8 flex-1">
              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-black text-stone-500 tracking-widest">Entrée créative</Label>
                <Textarea 
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={activeTab === 'burnout' ? "Décrivez votre état actuel (ex: je n'arrive plus à finir mes planches)..." : "Décrivez votre scène, personnage ou action..."}
                  className="min-h-[150px] bg-background/50 border-none rounded-[2rem] p-8 text-lg font-light italic"
                />
                <Button 
                  onClick={handleRunAi}
                  disabled={loading || !promptText.trim()}
                  className="w-full h-16 rounded-2xl bg-primary text-black font-black text-xl gold-shimmer shadow-2xl shadow-primary/20"
                >
                  {loading ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Analyse...</> : <><Sparkles className="mr-3 h-6 w-6" /> Lancer la génération</>}
                </Button>
              </div>

              {result && (
                <div className="animate-in slide-in-from-bottom-4 duration-700 pt-8 border-t border-border/50 space-y-6">
                  <div className="p-8 bg-muted/30 rounded-[2.5rem] border border-primary/10">
                    <h4 className="text-sm font-black uppercase text-primary mb-4 flex items-center gap-2">
                      <Wand2 className="h-4 w-4" /> Résultat de l'IA
                    </h4>
                    <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed font-serif text-lg italic">
                      {result.result}
                    </p>
                  </div>

                  {(result.recommendations || result.visualHints) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.recommendations?.map((rec: string, i: number) => (
                        <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex gap-3 items-start">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-emerald-700 font-medium">{rec}</p>
                        </div>
                      ))}
                      {result.visualHints?.map((hint: string, i: number) => (
                        <div key={i} className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3 items-start">
                          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 font-medium">{hint}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 4. SIDEBAR INFOS */}
        <aside className="space-y-8">
          <Card className="bg-stone-900 border-none rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5"><Zap className="h-32 w-32" /></div>
            <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest">Le Saviez-Vous ?</h4>
            <p className="text-stone-400 text-sm leading-relaxed italic font-light mb-8">
              "L'IA NexusHub est formée spécifiquement sur les traditions visuelles du continent. Elle ne remplace pas l'artiste, elle devient son assistant technique pour sublimer son héritage."
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center"><Wind className="h-4 w-4 text-cyan-500" /></div>
                <span className="text-[10px] font-bold uppercase text-stone-300">Gain de temps : +40%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center"><HeartPulse className="h-4 w-4 text-rose-500" /></div>
                <span className="text-[10px] font-bold uppercase text-stone-300">Mode Anti-Burnout activé</span>
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-muted/20 rounded-[2.5rem] p-8">
            <h4 className="text-xs font-black uppercase text-stone-500 mb-6 tracking-widest">Exemple de Storyboard</h4>
            <div className="aspect-[3/4] relative rounded-3xl overflow-hidden border-4 border-white/5 shadow-xl">
              <Image src="https://picsum.photos/seed/ai-art/600/800" alt="Exemple AI" fill className="object-cover opacity-40 grayscale" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Layout className="h-12 w-12 text-stone-600 mb-4" />
                <p className="text-[10px] text-stone-500 italic">"Générez des esquisses basées sur vos descriptions pour gagner du temps lors de la mise en page."</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 9-4.477 9-10S17.523 2 12 2 3 6.477 3 12s3.477 10 9 10z"/><path d="m9 12 2 2 4-4"/></svg>
}

function Label({ children, className }: any) {
  return <label className={cn("text-xs font-bold text-foreground", className)}>{children}</label>;
}
