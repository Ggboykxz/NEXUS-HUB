'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Users, Award, PenSquare, Loader2, Search, Filter, MapPin, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ArtistsPage() {
  const [artists, setArtists] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    async function fetchArtists() {
      try {
        const q = query(collection(db, 'users'), where('role', 'in', ['artist_draft', 'artist_pro']));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        
        // Tri par défaut : subscribersCount desc
        const sorted = data.sort((a, b) => (b.subscribersCount || 0) - (a.subscribersCount || 0));
        setArtists(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  // Logique de filtrage client-side
  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      const matchesSearch = artist.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           artist.bio?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecialty = specialtyFilter === 'all' || artist.role === specialtyFilter; // Simplification pour le prototype
      
      // En prod, on utiliserait artist.region ou artist.country
      const matchesRegion = regionFilter === 'all' || artist.country === regionFilter; 

      return matchesSearch && matchesSpecialty && matchesRegion;
    });
  }, [artists, searchQuery, specialtyFilter, regionFilter]);

  const proArtists = filteredArtists.filter(a => a.role === 'artist_pro');
  const draftArtists = filteredArtists.filter(a => a.role === 'artist_draft');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-stone-500 font-display font-black uppercase text-[10px] tracking-widest">Appel des maîtres...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-12 space-y-12">
      {/* HEADER & CONTROLS */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold font-display tracking-tighter text-white">Nos Artistes</h1>
                <Badge variant="outline" className="border-primary/20 text-primary font-black px-3 py-1">
                  {filteredArtists.length} Voyageurs
                </Badge>
              </div>
            </div>
            <p className="text-lg text-stone-400 font-light italic max-w-2xl">
              "Découvrez les esprits créatifs qui forgent l'imaginaire du continent. Des maîtres certifiés aux nouveaux talents prometteurs."
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher un nom, un style..." 
              className="h-12 pl-12 rounded-2xl bg-white/5 border-white/5 focus:border-primary/50 transition-all shadow-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="flex flex-wrap items-center gap-4 p-2 bg-stone-900/50 backdrop-blur-xl border border-white/5 rounded-3xl">
          <div className="flex items-center gap-3 px-4 py-2 border-r border-white/5 mr-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Affiner</span>
          </div>

          <div className="flex flex-wrap gap-4 flex-1">
            <div className="space-y-1">
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-transparent border-none focus:ring-0 text-xs font-bold uppercase tracking-widest">
                  <Palette className="h-3.5 w-3.5 mr-2 text-stone-500" />
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-white/10">
                  <SelectItem value="all">Toutes Spécialités</SelectItem>
                  <SelectItem value="artist_pro">Auteur complet</SelectItem>
                  <SelectItem value="artist_draft">Dessinateur</SelectItem>
                  <SelectItem value="scenarist">Scénariste</SelectItem>
                  <SelectItem value="colorist">Coloriste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-transparent border-none focus:ring-0 text-xs font-bold uppercase tracking-widest">
                  <MapPin className="h-3.5 w-3.5 mr-2 text-stone-500" />
                  <SelectValue placeholder="Région" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-white/10">
                  <SelectItem value="all">Toutes Régions</SelectItem>
                  <SelectItem value="SN">Afrique de l'Ouest</SelectItem>
                  <SelectItem value="GA">Afrique Centrale</SelectItem>
                  <SelectItem value="KE">Afrique de l'Est</SelectItem>
                  <SelectItem value="ZA">Afrique Australe</SelectItem>
                  <SelectItem value="FR">Diaspora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setSearchQuery(''); setSpecialtyFilter('all'); setRegionFilter('all'); }}
            className="text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-white"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* PRO SECTION */}
      {proArtists.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-emerald-500/10 p-2 rounded-xl">
              <Award className="text-emerald-500 h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-white uppercase">NexusHub Pro</h2>
              <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest">L'excellence de la narration</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {proArtists.map((artist) => (
              <Link key={artist.uid} href={`/artiste/${artist.slug}`} className="group">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-stone-950 ring-4 ring-emerald-500/20 group-hover:ring-emerald-500 transition-all duration-500 shadow-2xl">
                      <AvatarImage src={artist.photoURL} alt={artist.displayName} className="object-cover" />
                      <AvatarFallback className="bg-stone-900 text-stone-500 font-black text-2xl">{artist.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-stone-950 shadow-xl">
                      <Award className="h-3 w-3" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-black text-white group-hover:text-emerald-500 transition-colors truncate">{artist.displayName}</h3>
                    <p className="text-[9px] text-stone-500 uppercase font-black tracking-widest mt-1">{(artist.subscribersCount || 0).toLocaleString()} abonnés</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* DRAFT SECTION */}
      {draftArtists.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-orange-500/10 p-2 rounded-xl">
              <PenSquare className="text-orange-500 h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-white uppercase">NexusHub Draft</h2>
              <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest">Les nouveaux visages du 9ème art</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {draftArtists.map((artist) => (
              <Link key={artist.uid} href={`/artiste/${artist.slug}`} className="group">
                <div className="text-center space-y-4">
                  <Avatar className="h-28 w-28 md:h-32 md:w-32 mx-auto border-4 border-stone-950 ring-2 ring-orange-500/20 group-hover:ring-orange-500 transition-all duration-500 grayscale-[0.4] group-hover:grayscale-0 shadow-xl">
                    <AvatarImage src={artist.photoURL} alt={artist.displayName} className="object-cover" />
                    <AvatarFallback className="bg-stone-900 text-stone-500 font-black text-xl">{artist.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-base font-display font-black text-white group-hover:text-orange-500 transition-colors truncate">{artist.displayName}</h3>
                    <p className="text-[8px] text-stone-600 uppercase font-black tracking-widest mt-1">Nouveau Talent</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {filteredArtists.length === 0 && (
        <div className="text-center py-32 bg-stone-900/30 rounded-[3rem] border-2 border-dashed border-white/5 space-y-6">
          <div className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center opacity-20">
            <Search className="h-10 w-10 text-stone-500" />
          </div>
          <p className="text-stone-500 italic font-light">"Aucun artiste ne correspond à ces critères dans les sables du Hub."</p>
          <Button variant="outline" onClick={() => { setSearchQuery(''); setSpecialtyFilter('all'); setRegionFilter('all'); }} className="rounded-full border-primary text-primary">Réinitialiser les filtres</Button>
        </div>
      )}
    </div>
  );
}
