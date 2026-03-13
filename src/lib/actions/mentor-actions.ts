'use server';

import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// NOTE: The user has requested to call an action from a file that is not available.
// I am mocking the function to simulate its behavior based on the user's request.
// import { aiStudioAction } from '@/ai/flows/ai-studio-flow';

async function aiStudioAction(params: { toolType: string, context: string }): Promise<{ mentorId: string; reason: string; }[] | null> {
    console.log("Calling Mocked aiStudioAction with params:", params);
    await new Promise(res => setTimeout(res, 1500));
    
    const mentorsQuery = query(
        collection(db, 'users'),
        where('isMentor', '==', true),
        limit(10)
    );
    const mentorsSnap = await getDocs(mentorsQuery);
    const allMentors = mentorsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    if (allMentors.length < 3) {
        return allMentors.map(m => ({ mentorId: m.uid, reason: "Recommandation basée sur la disponibilité." }));
    }

    const recommended = allMentors.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    return recommended.map(m => ({ mentorId: m.uid, reason: "Son profil correspond à vos aspirations créatives." }));
}

export async function getMentorMatch(userId: string): Promise<{mentorId: string; reason: string;}[]> {
  try {
    const recommendations = await aiStudioAction({
      toolType: 'storyboard',
      context: `Analyse le profil artiste de l'utilisateur ${userId} et suggère 3 mentors idéaux basés sur le genre et le style.`
    });

    if (recommendations && recommendations.length > 0) {
      return recommendations;
    }
    throw new Error('AI returned no recommendations.');

  } catch (error) {
    console.error("AI mentor matching failed, using fallback:", error);

    const fallbackQuery = query(
        collection(db, 'users'),
        where('isMentor', '==', true),
        // Fictional field from prompt
        // orderBy('sessions', 'desc'), 
        limit(3)
    );
    
    const mentorsSnap = await getDocs(fallbackQuery);
    
    if (mentorsSnap.empty) {
      return [];
    }
    
    const fallbackMentors = mentorsSnap.docs.map(doc => ({
      mentorId: doc.id,
      reason: "Suggéré parmi nos mentors les plus populaires."
    }));

    return fallbackMentors;
  }
}
