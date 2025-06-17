
'use server';
/**
 * @fileOverview An AI agent for translating text.
 *
 * - translateText - A function that translates text to a specified target language.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Language } from '@/types';

const targetLanguageCodeSchema = z.enum(['en', 'fr', 'rw']);

const TranslateTextInputSchema = z.object({
  textToTranslate: z.string().describe('The text content to be translated.'),
  targetLanguageCode: targetLanguageCodeSchema.describe("The target language code (e.g., 'fr' for French, 'rw' for Kinyarwanda). The source language is assumed to be English."),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

// Helper to get full language name for the prompt
const getLanguageName = (code: 'en' | 'fr' | 'rw'): string => {
  switch (code) {
    case 'fr':
      return 'French';
    case 'rw':
      return 'Kinyarwanda';
    case 'en':
      return 'English';
    default:
      return 'the specified language';
  }
};

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `Translate the following text into {{targetLanguageName}}.
Do not translate proper nouns or brand names like 'Cribs Ink' unless it is contextually appropriate for the target language.

Original Text:
{{{textToTranslate}}}
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input: TranslateTextInput) => {
    const targetLanguageName = getLanguageName(input.targetLanguageCode);
    const {output} = await prompt({
      ...input,
      targetLanguageName // Pass the full name to the prompt through context
    });
    return output!;
  }
);
