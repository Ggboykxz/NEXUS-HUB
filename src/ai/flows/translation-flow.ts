'use server';
/**
 * @fileOverview Traduction assistée par IA avec adaptation culturelle pour NexusHub.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslationInputSchema = z.object({
  text: z.string().describe('Le texte à traduire.'),
  targetLang: z.enum(['en', 'sw', 'ha', 'yo', 'fr']).describe('La langue cible.'),
  context: z.string().optional().describe('Contexte de la scène pour adapter les expressions.'),
});

const TranslationOutputSchema = z.object({
  translatedText: z.string().describe('Le texte traduit.'),
  culturalNotes: z.string().describe('Notes sur l\'adaptation des expressions idiomatiques.'),
});

export async function translateContent(input: z.infer<typeof TranslationInputSchema>) {
  return translationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translationPrompt',
  input: { schema: TranslationInputSchema },
  output: { schema: TranslationOutputSchema },
  prompt: `Tu es un traducteur littéraire expert en langues africaines et internationales.
  
  Texte à traduire : {{{text}}}
  Langue cible : {{{targetLang}}}
  Contexte : {{{context}}}

  Objectif : Traduis le texte tout en préservant les nuances culturelles. Si une expression idiomatique africaine est utilisée, trouve l'équivalent le plus proche ou adapte-la pour qu'elle résonne naturellement dans la langue cible.`,
});

const translationFlow = ai.defineFlow(
  {
    name: 'translationFlow',
    inputSchema: TranslationInputSchema,
    outputSchema: TranslationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
