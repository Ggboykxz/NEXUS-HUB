'use client';
/**
 * @fileOverview Provider pour la gestion globale des genres utilisant TanStack Query.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';

interface Genre {
  name: string;
  slug: string;
}

interface GenresContextType {
  genres: Genre[];
  isLoading: boolean;
}

const GenresContext = createContext<GenresContextType | undefined>(undefined);

export function GenresProvider({ children }: { children: ReactNode }) {
  const { data: genres = [], isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      // Récupère un échantillon de stories pour extraire les genres uniques
      const q = query(collection(db, 'stories'), limit(100));
      const snap = await getDocs(q);
      const genreMap = new Map<string, string>();
      
      snap.forEach(doc => {
        const data = doc.data();
        if (data.genre && data.genreSlug) {
          genreMap.set(data.genreSlug, data.genre);
        }
      });

      const genreList = Array.from(genreMap.entries()).map(([slug, name]) => ({
        name,
        slug,
      }));

      return genreList.sort((a, b) => a.name.localeCompare(b.name));
    },
    staleTime: Infinity, // Les genres changent rarement, on les garde indéfiniment
  });

  return (
    <GenresContext.Provider value={{ genres, isLoading }}>
      {children}
    </GenresContext.Provider>
  );
}

export function useGenres() {
  const context = useContext(GenresContext);
  if (context === undefined) {
    throw new Error('useGenres must be used within a GenresProvider');
  }
  return context;
}
