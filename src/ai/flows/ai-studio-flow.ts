'use server';
/**
 * @fileOverview NexusHub AI Studio - Flux Genkit pour l'assistance créative avancée.
 * 
 * - generateStoryboard: Génère une séquence d'esquisses à partir d'un texte.
 * - getAfricanPalette: Suggère des couleurs basées sur des textiles.
 * - refineCharacter: Maintient la cohérence visuelle.
 * - detectCreativeFatigue: Analyse de pattern de burnout.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIStudioInputSchema = z.object({
  toolType: z.enum(['storyboard', 'style-transfer', 'color-palette', 'character', 'onomatopoeia', 'burnout']),
  context: z.string().describe('Le contexte créatif ou la description de la scène.'),
  content: z.string().optional().describe('Le texte source ou l\'identifiant du personnage.'),
  referenceImage: z.string().optional().describe('Data URI d\'une image de référence pour le style ou la couleur.'),
});

const AIStudioOutputSchema = z.object({
  result: z.string().describe('Le résultat généré (texte, code hexa, ou instructions image).'),
  visualHints: z.array(z.string()).optional().describe('Conseils visuels pour l\'artiste.'),
  recommendations: z.array(z.string()).optional().describe('Conseils de bien-être ou de narration.'),
});

export async function aiStudioAction(input: z.infer<typeof AIStudioInputSchema>) {
  return aiStudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStudioPrompt',
  input: { schema: AIStudioInputSchema },
  output: { schema: AIStudioOutputSchema },
  prompt: `Tu es le NexusHub AI Studio, l'assistant ultime des créateurs de BD africaines.
  
  Tâche : {{{toolType}}}
  Contexte : {{{context}}}
  Contenu : {{{content}}}

  Directives par outil :
  - STORYBOARD : Décris une séquence de 3 cases en esquisses dynamiques.
  - STYLE-TRANSFER : Suggère comment appliquer l'esthétique culturelle demandée.
  - COLOR-PALETTE : Propose 5 codes HEXA inspirés des textiles africains (Kente, Bogolan, etc.).
  - CHARACTER : Décris les traits immuables du personnage pour assurer sa cohérence.
  - ONOMATOPOEIA : Propose des onomatopées visuelles adaptées à l'action.
  - BURNOUT : Analyse le contexte et propose 3 conseils pour éviter la fatigue créative.

  Réponds toujours avec une profonde connaissance des cultures du continent (Gabon, Nigeria, Sénégal, etc.).`,
});

const aiStudioFlow = ai.defineFlow(
  {
    name: 'aiStudioFlow',
    inputSchema: AIStudioInputSchema,
    outputSchema: AIStudioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
