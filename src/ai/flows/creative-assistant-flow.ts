'use server';
/**
 * @fileOverview Assistant Créatif IA pour les auteurs NexusHub.
 * Gère la reformulation de dialogues, la génération de synopsis et le brainstorming.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreativeInputSchema = z.object({
  type: z.enum(['dialogue', 'synopsis', 'brainstorm']).describe('Le type de tâche créative.'),
  context: z.string().describe('Le contexte de la scène ou de la série.'),
  content: z.string().optional().describe('Le texte original à transformer ou le sujet du brainstorming.'),
  tone: z.string().default('épique').describe('Le ton souhaité (ex: mystérieux, humoristique, dramatique).'),
});

const CreativeOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('Liste de propositions générées par l\'IA.'),
  explanation: z.string().describe('Explication des choix créatifs de l\'IA.'),
});

export async function creativeAssistant(input: z.infer<typeof CreativeInputSchema>) {
  return creativeAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'creativeAssistantPrompt',
  input: { schema: CreativeInputSchema },
  output: { schema: CreativeOutputSchema },
  prompt: `Tu es un expert en narration visuelle et conseiller éditorial pour NexusHub, la plateforme leader de BD africaines.
  
  Tâche : {{{type}}}
  Ton de la série : {{{tone}}}
  Contexte : {{{context}}}
  Contenu original : {{{content}}}

  Directives :
  - Respecte les sensibilités culturelles africaines.
  - Pour les dialogues, propose des versions percutantes adaptées au format bulles.
  - Pour le synopsis, sois accrocheur et mystérieux (3 lignes max).
  - Pour le brainstorming, inspire-toi des mythologies, paysages et cultures du continent.`,
});

const creativeAssistantFlow = ai.defineFlow(
  {
    name: 'creativeAssistantFlow',
    inputSchema: CreativeInputSchema,
    outputSchema: CreativeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
