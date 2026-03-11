
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, Target, Users, Languages, Accessibility, ShieldCheck, BookOpen, Globe, Award, Sparkles, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getCountFromServer, getDocs, limit } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const revalidate = 3600; // Revalider toutes les heures

async function getStats() {
    try {
        const storiesQuery = query(collection(db, 'stories'), where('isPublished', '==', true));
        const artistsQuery = query(collection(db, 'users'), where('role', 'in', ['artist_pro', 'artist_elite']));
        
        const [storiesSnap, artistsSnap] = await Promise.all([
            getCountFromServer(storiesQuery),
            getCountFromServer(artistsQuery)
        ]);

        return {
            stories: storiesSnap.data().count,
            artists: artistsSnap.data().count,
            countries: 15 
        };
    } catch (e) {
        console.error("Error fetching about stats:", e);
        return { stories: 0, artists: 0, countries: 0 };
    }
}

async function getTeam() {
    try {
        const teamSnap = await getDocs(query(collection(db, 'team'), limit(6)));
        return teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    } catch (e) {
        return [];
    }
}

export default async function AboutPage() {
    const stats = await getStats();
    const team = await getTeam();
    const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

    const values = [
        {
            icon: Heart,
            title: 'Passion',
            description: 'Nous sommes animés par l\'amour de la narration et de l\'art visuel africain.',
        },
        {
            icon: Users,
            title: 'Communauté',
            description: 'Un espace inclusif pour tous les créateurs et lecteurs du continent et d\'ailleurs.',
        },
        {
            icon: Target,
            title: 'Opportunité',
            description: 'Créer des débouchés économiques réels pour les artistes via les AfriCoins et la crypto.',
        },
    ];

    return (
        <div className="animate-in fade-in duration-1000">
            {/* HERO SECTION */}
            <section className="relative py-32 bg-stone-950 overflow-hidden border-b border-primary/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
                <div className="container mx-auto max-w-7xl px-6 text-center relative z-10">
                    <Badge variant="outline" className="mb-6 border-primary/20 text-primary px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">Notre Histoire</Badge>
                    <h1 className="text-5xl md:text-8xl font-display font-black text-white mb-8 tracking-tighter leading-none">
                        Au Cœur des <br/><span className="gold-resplendant">Légendes</span>
                    </h1>
                    <p className="text-xl text-stone-400 max-w-3xl mx-auto italic font-light leading-relaxed">
                        "La plateforme de la narration visuelle africaine. Un pont entre les créateurs et leur public mondial, sans barrières de langue ou de capacité."
                    </p>
                </div>
            </section>

            {/* LIVE STATS SECTION */}
            <section className="py-20 bg-background border-b border-border/50">
                <div className="container mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center space-y-2">
                            <div className="text-6xl md:text-7xl font-display font-black text-primary drop-shadow-xl">{stats.artists}+</div>
                            <p className="text-[10px] uppercase font-black text-stone-500 tracking-[0.3em]">Créateurs Passionnés</p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-6xl md:text-7xl font-display font-black text-white drop-shadow-xl">{stats.stories}+</div>
                            <p className="text-[10px] uppercase font-black text-stone-500 tracking-[0.3em]">Œuvres Originales</p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-6xl md:text-7xl font-display font-black text-emerald-500 drop-shadow-xl">{stats.countries}</div>
                            <p className="text-[10px] uppercase font-black text-stone-500 tracking-[0.3em]">Pays Représentés</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM SECTION */}
            {team.length > 0 && (
                <section className="py-24 bg-stone-900/30">
                    <div className="container mx-auto max-w-7xl px-6">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-4xl font-display font-black text-white tracking-tighter">Les Gardiens du Hub</h2>
                            <p className="text-stone-500 italic">"Une équipe passionnée dédiée au rayonnement de votre art."</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {team.map((member: any, index: number) => (
                                <Card key={index} className="bg-stone-950 border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all shadow-xl">
                                    <CardContent className="p-10 text-center space-y-6">
                                        <Avatar className="w-32 h-32 mx-auto border-4 border-primary/20 ring-4 ring-transparent group-hover:ring-primary/10 transition-all shadow-2xl">
                                            <AvatarImage src={member.image} alt={member.name} className="object-cover" />
                                            <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">{member.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-2xl font-display font-black text-white mb-1">{member.name}</h3>
                                            <Badge className="bg-primary text-black font-black uppercase text-[8px] tracking-widest">{member.role}</Badge>
                                        </div>
                                        <p className="text-sm text-stone-400 font-light italic leading-relaxed">"{member.bio}"</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            
            {/* VALUES SECTION */}
            <section className="py-24">
                <div className="container mx-auto max-w-7xl px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-display font-black text-white tracking-tighter">Nos Valeurs Fondamentales</h2>
                        <p className="text-stone-500 max-w-2xl mx-auto italic font-light">
                            "Ce qui nous guide chaque jour dans la construction de l'avenir du 9ème art africain."
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <Card key={index} className="text-center p-10 bg-white/[0.02] border-white/5 hover:border-primary/20 transition-all rounded-[3rem] group">
                                <div className="mx-auto bg-primary/10 rounded-full p-6 w-fit mb-8 shadow-inner transition-transform group-hover:scale-110">
                                    <value.icon className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-2xl font-display font-black text-white mb-4 uppercase tracking-tighter">{value.title}</CardTitle>
                                <CardContent className="p-0">
                                    <p className="text-stone-400 leading-relaxed italic font-light">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
