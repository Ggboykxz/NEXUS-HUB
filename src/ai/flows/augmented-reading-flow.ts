'use server';
/**
 * @fileOverview Assistant de lecture augmentée pour NexusHub.
 * Gère les résumés de rattrapage, les explications culturelles et le chatbot contextuel.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AugmentedInputSchema = z.object({
  type: z.enum(['summary', 'glossary', 'chat', 'translate']),
  storyTitle: z.string(),
  context: z.string().optional(),
  userQuery: z.string().optional(),
  panelContent: z.string().optional(),
});

const AugmentedOutputSchema = z.object({
  result: z.string(),
  metadata: z.record(z.any()).optional(),
});

export async function augmentedReadingAction(input: z.infer<typeof AugmentedInputSchema>) {
  return augmentedReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'augmentedReadingPrompt',
  input: { schema: AugmentedInputSchema },
  output: { schema: AugmentedOutputSchema },
  prompt: `Tu es l'Assistant de Lecture NexusHub, expert en culture africaine et narration visuelle.
  
  Tâche : {{{type}}}
  Série : {{{storyTitle}}}
  Contexte actuel : {{{context}}}
  Requête : {{{userQuery}}}
  Contenu du panneau : {{{panelContent}}}

  Directives :
  - SUMMARY : Génère un résumé de rattrapage de 100 mots maximum pour les derniers chapitres manqués.
  - GLOSSARY : Explique l'origine et la signification culturelle de l'élément mentionné (ex: Bogolan, Masque Fang).
  - CHAT : Réponds à la question de l'utilisateur sur le lore, les personnages ou la timeline de manière immersive.
  - TRANSLATE : Traduis le texte du panneau en français naturel tout en gardant les nuances culturelles.

  Réponds toujours avec bienveillance et expertise panafricaine.`,
});

const augmentedReadingFlow = ai.defineFlow(
  {
    name: 'augmentedReadingFlow',
    inputSchema: AugmentedInputSchema,
    outputSchema: AugmentedOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
