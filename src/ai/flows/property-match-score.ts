// Implemented by Gemini.
'use server';

/**
 * @fileOverview An AI agent that provides a match score for each property based on the tenant's profile.
 *
 * - propertyMatchScore - A function that calculates the match score between a property and a tenant profile.
 * - PropertyMatchScoreInput - The input type for the propertyMatchScore function.
 * - PropertyMatchScoreOutput - The return type for the propertyMatchScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PropertyMatchScoreInputSchema = z.object({
  propertyDescription: z.string().describe('The description of the property.'),
  tenantPreferences: z.string().describe('The tenant profile including budget, location, and property preferences.'),
});
export type PropertyMatchScoreInput = z.infer<typeof PropertyMatchScoreInputSchema>;

const PropertyMatchScoreOutputSchema = z.object({
  matchScore: z.number().describe('A score between 0 and 1 indicating how well the property matches the tenant preferences.'),
  reasoning: z.string().describe('The reasoning behind the match score.'),
});
export type PropertyMatchScoreOutput = z.infer<typeof PropertyMatchScoreOutputSchema>;

export async function propertyMatchScore(input: PropertyMatchScoreInput): Promise<PropertyMatchScoreOutput> {
  return propertyMatchScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'propertyMatchScorePrompt',
  input: {schema: PropertyMatchScoreInputSchema},
  output: {schema: PropertyMatchScoreOutputSchema},
  prompt: `You are an AI agent that calculates a match score between a property and a tenant profile.

Given the following property description:

{{propertyDescription}}

And the following tenant preferences:

{{tenantPreferences}}

Calculate a match score between 0 and 1, where 1 indicates a perfect match and 0 indicates no match at all. Also provide a reasoning for the score.

Respond with the matchScore and reasoning.`,
});

const propertyMatchScoreFlow = ai.defineFlow(
  {
    name: 'propertyMatchScoreFlow',
    inputSchema: PropertyMatchScoreInputSchema,
    outputSchema: PropertyMatchScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
