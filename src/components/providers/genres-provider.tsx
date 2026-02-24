'use client';
/**
 * @fileOverview Provider pour la gestion globale des genres.
 * Évite les requêtes multiples vers Firestore lors de la navigation.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

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
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGenres() {
      try {
        // On récupère un échantillon de stories pour extraire les genres uniques
        // Dans une version plus avancée, on utiliserait une collection 'metadata/genres'
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

        // Tri alphabétique
        genreList.sort((a, b) => a.name.localeCompare(b.name));

        setGenres(genreList);
      } catch (e) {
        console.error("Error fetching genres:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGenres();
  }, []);

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
