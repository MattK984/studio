// Summarize DLP metadata.
'use server';

/**
 * @fileOverview Summarizes DLP metadata using GenAI.
 *
 * - summarizeDlpMetadata - A function that summarizes the metadata of a DLP.
 * - SummarizeDlpMetadataInput - The input type for the summarizeDlpMetadata function.
 * - SummarizeDlpMetadataOutput - The return type for the summarizeDlpMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDlpMetadataInputSchema = z.object({
  metadata: z.string().describe('The metadata of the DLP.'),
});

export type SummarizeDlpMetadataInput = z.infer<
  typeof SummarizeDlpMetadataInputSchema
>;

const SummarizeDlpMetadataOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the DLP metadata.'),
});

export type SummarizeDlpMetadataOutput = z.infer<
  typeof SummarizeDlpMetadataOutputSchema
>;

export async function summarizeDlpMetadata(
  input: SummarizeDlpMetadataInput
): Promise<SummarizeDlpMetadataOutput> {
  return summarizeDlpMetadataFlow(input);
}

const summarizeDlpMetadataPrompt = ai.definePrompt({
  name: 'summarizeDlpMetadataPrompt',
  input: {schema: SummarizeDlpMetadataInputSchema},
  output: {schema: SummarizeDlpMetadataOutputSchema},
  prompt: `Summarize the following DLP metadata, highlighting key attributes and performance insights:\n\nMetadata: {{{metadata}}}`,
});

const summarizeDlpMetadataFlow = ai.defineFlow(
  {
    name: 'summarizeDlpMetadataFlow',
    inputSchema: SummarizeDlpMetadataInputSchema,
    outputSchema: SummarizeDlpMetadataOutputSchema,
  },
  async input => {
    const {output} = await summarizeDlpMetadataPrompt(input);
    return output!;
  }
);
