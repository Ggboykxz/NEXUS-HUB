'use server';
/**
 * @fileOverview NexusHub Editorial AI - Flux Genkit pour l'assistance narrative.
 * 
 * - rhythm: Analyse du rythme et détection des incohérences.
 * - cliche: Détection des tropes surexploités.
 * - dialogue: Suggestions d'amélioration des dialogues.
 * - culture: Vérification de la conformité culturelle africaine.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EditorialInputSchema = z.object({
  type: z.enum(['rhythm', 'cliche', 'dialogue', 'culture']),
  genre: z.string().describe('Le genre de l\'œuvre (ex: Mythologie, Afrofuturisme)'),
  content: z.string().describe('Le texte du scénario ou de la scène à analyser.'),
  context: z.string().optional().describe('Contexte additionnel sur l\'univers.'),
});

const EditorialOutputSchema = z.object({
  analysis: z.string().describe('Analyse détaillée de l\'IA.'),
  suggestions: z.array(z.string()).describe('Liste de propositions concrètes.'),
  warnings: z.array(z.string()).optional().describe('Alertes (clichés, incohérences).'),
  culturalNotes: z.string().optional().describe('Remarques sur l\'authenticité culturelle.'),
});

export async function editorialAction(input: z.infer<typeof EditorialInputSchema>) {
  return editorialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editorialPrompt',
  input: { schema: EditorialInputSchema },
  output: { schema: EditorialOutputSchema },
  prompt: `Tu es l'Éditeur en Chef de NexusHub, expert en narration visuelle panafricaine.
  
  Tâche : {{{type}}}
  Genre : {{{genre}}}
  Contexte : {{{context}}}
  Contenu : {{{content}}}

  Directives spécifiques par outil :
  - RHYTHM : Analyse le rythme narratif. Identifie les moments trop lents, les ellipses brutales ou les incohérences de plot.
  - CLICHE : Identifie les clichés et tropes surexploités dans le genre {{{genre}}}. Propose des angles plus originaux.
  - DIALOGUE : Propose 3 manières différentes de reformuler ces dialogues pour qu'ils soient plus naturels, émouvants ou percutants dans une bulle.
  - CULTURE : Vérifie que les noms, traditions et éléments visuels décrits respectent l'authenticité des cultures africaines citées. Signale les imprécisions.

  Réponds avec une expertise bienveillante, en valorisant l'héritage du continent (Gabon, Sénégal, Nigeria, etc.).`,
});

const editorialFlow = ai.defineFlow(
  {
    name: 'editorialFlow',
    inputSchema: EditorialInputSchema,
    outputSchema: EditorialOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
