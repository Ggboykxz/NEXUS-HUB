
'use server';

/**
 * This file contains server actions related to the mentorship feature.
 * NOTE: As we don't have access to the actual AI flows or a live database,
 * this file uses mocked implementations for demonstration purposes.
 */

// Mocked AI Flow - In a real scenario, this would import from '@/ai/flows/ai-studio-flow'
const aiStudioAction = async (options: { toolType: string; context: string; }): Promise<{ result: string; }> => {
  console.log('--- MOCKED AI STUDIO ACTION ---');
  console.log(`Tool Type: ${options.toolType}`);
  console.log(`Context: ${options.context}`);

  // To demonstrate the fallback mechanism, we will simulate an API error.
  // To test the success path, comment out the following line and the AI will return mock data.
  throw new Error('Simulated AI API failure.');

  // This is what the AI would return on a successful run.
  // The mentor IDs would correspond to actual UIDs in the database.
  return {
    result: JSON.stringify([
      { mentorId: 'uid-mentor-1', reason: 'Style artistique et thèmes narratifs similaires.' },
      { mentorId: 'uid-mentor-2', reason: 'Forte expérience en publication numérique, pertinente pour vos objectifs.' },
      { mentorId: 'uid-mentor-3', reason: 'Compétences en character design qui complètent les vôtres.' },
    ]),
  };
};

// Mocked Database - In a real scenario, this would use the Firebase Admin SDK
// to fetch real user profiles from Firestore.
const getMentorsFromDB = async () => {
    console.log('--- MOCKED DATABASE FETCH ---');
    // These are fake mentor profiles for the fallback mechanism.
    // The `sessions` property is fictional, as requested.
    const allMentors = [
        // Let's use UIDs that might exist in the actual DB to see them highlighted
        { uid: 'Qc0d2Fj2zjeCq1Jv2v2HHdCKA4E2', displayName: 'Gaëlle', sessions: 152 },
        { uid: 'some-other-uid-1', displayName: 'Christophe', sessions: 98 },
        { uid: 'some-other-uid-2', displayName: 'Amina', sessions: 178 },
        { uid: 'some-other-uid-3', displayName: 'Yann', sessions: 85 },
    ];
    // Let's make the fallback recommend mentors that are actually in the list.
    const response = await fetch('https://gist.githubusercontent.com/Stevan-A/48964828b037325e0114f6b0b27150c9/raw/f2b13c36c6422b988f11f6f2e21b06f8a8b11145/nexus-hub-mentors.json');
    const mentors = await response.json();
    
    return mentors.map((m: any) => ({...m, sessions: Math.floor(Math.random() * 200)}));
}

/**
 * Gets AI-powered mentor recommendations for a given user.
 * If the AI analysis fails, it falls back to a list of the most experienced mentors.
 * @param userId - The ID of the user seeking mentorship.
 * @returns A promise that resolves to an array of mentor recommendations.
 */
export async function getMentorMatch(userId: string): Promise<{ mentorId: string; reason: string }[]> {
  console.log(`[Server Action] getMentorMatch called for user: ${userId}`);

  try {
    const response = await aiStudioAction({
      toolType: 'storyboard',
      context: "Analyse le profil artiste et suggère 3 mentors idéaux basés sur le genre et le style.",
    });

    const matches = JSON.parse(response.result);

    if (Array.isArray(matches) && matches.length > 0) {
        return matches.slice(0, 3).map(match => ({
            mentorId: match.mentorId,
            reason: match.reason || 'Recommandation de l'IA Nexus',
        }));
    }
    // If AI returns empty/invalid data, throw to trigger fallback
    throw new Error('AI returned no valid matches.');

  } catch (error) {
    console.warn('[Server Action] AI matching failed. Executing fallback mechanism.', error);
    
    const filteredMentors = await getMentorsFromDB();

    // Sort mentors by the fictional session count in descending order
    const sortedMentors = filteredMentors.sort((a, b) => b.sessions - a.sessions);

    // Return the top 3 mentors from the sorted list
    return sortedMentors.slice(0, 3).map(mentor => ({
      mentorId: mentor.uid,
      reason: `Recommandé pour sa grande expérience (${mentor.sessions} sessions)`,
    }));
  }
}