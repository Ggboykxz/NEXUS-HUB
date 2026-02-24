'use server';
/**
 * @fileOverview Assistant Créatif IA pour les auteurs NexusHub.
 * Gère la reformulation, le synopsis, le rythme narratif et le brainstorming.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreativeInputSchema = z.object({
  type: z.enum(['dialogue', 'synopsis', 'brainstorm', 'rhythm', 'tags']).describe('Le type de tâche créative.'),
  context: z.string().describe('Le contexte de la scène ou de la série.'),
  content: z.string().optional().describe('Le texte original à transformer ou le sujet du brainstorming.'),
  tone: z.string().default('épique').describe('Le ton souhaité (ex: mystérieux, humoristique, dramatique).'),
});

const CreativeOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('Liste de propositions générées par l\'IA.'),
  explanation: z.string().describe('Explication des choix créatifs de l\'IA.'),
  metadata: z.record(z.any()).optional().describe('Données additionnelles (ex: score de rythme, tags suggérés).'),
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

  Directives spécifiques :
  - Respecte scrupuleusement les sensibilités culturelles africaines (Gabon, Afrique de l'Ouest, etc.).
  - Pour les DIALOGUES, propose des versions percutantes adaptées aux bulles.
  - Pour le SYNOPSIS, génère exactement 3 lignes accrocheuses pour les métadonnées.
  - Pour le RYTHME, analyse si le script est trop dense ou vide et propose des ajustements.
  - Pour les TAGS, suggère 5 hashtags culturels pertinents.
  - Pour le BRAINSTORMING, inspire-toi des mythologies et du futurisme du continent.`,
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
