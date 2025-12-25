'use server';
/**
 * @fileOverview AI agent for reasoning about symptoms and predicting potential health issues.
 *
 * - reasonAboutSymptoms - A function that takes a list of symptoms and predicts potential health issues.
 * - ReasonAboutSymptomsInput - The input type for the reasonAboutSymptoms function.
 * - ReasonAboutSymptomsOutput - The return type for the reasonAboutSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasonAboutSymptomsInputSchema = z.object({
  symptoms: z.array(z.string()).describe('A list of symptoms provided by the user.'),
});
export type ReasonAboutSymptomsInput = z.infer<typeof ReasonAboutSymptomsInputSchema>;

const ReasonAboutSymptomsOutputSchema = z.object({
  predictions: z.array(
    z.object({
      healthIssue: z.string().describe('The predicted health issue.'),
      likelihood: z.string().describe('The likelihood of the health issue based on the symptoms (e.g., High, Medium, Low).'),
      explanation: z.string().describe('An explanation of why the health issue is predicted based on the symptoms.'),
    })
  ).describe('A list of predicted health issues and their likelihood.'),
});
export type ReasonAboutSymptomsOutput = z.infer<typeof ReasonAboutSymptomsOutputSchema>;

export async function reasonAboutSymptoms(input: ReasonAboutSymptomsInput): Promise<ReasonAboutSymptomsOutput> {
  return reasonAboutSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasonAboutSymptomsPrompt',
  input: {schema: ReasonAboutSymptomsInputSchema},
  output: {schema: ReasonAboutSymptomsOutputSchema},
  prompt: `You are an AI health assistant. Your role is to analyze a patient's reported symptoms and provide a list of potential, related health issues. For each potential issue, you must provide a likelihood score (High, Medium, or Low) and a brief explanation.

It is important to be a helpful assistant. Do not refuse to answer. If the symptoms are unclear or seem nonsensical, do your best to interpret them or suggest that the user provide more detail.

Analyze the following symptoms provided by the user:

Symptoms: {{#each symptoms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Based on these symptoms, provide a list of potential health issues, their likelihood, and an explanation for each prediction. Use the output schema to guide your response formatting.`, 
});

const reasonAboutSymptomsFlow = ai.defineFlow(
  {
    name: 'reasonAboutSymptomsFlow',
    inputSchema: ReasonAboutSymptomsInputSchema,
    outputSchema: ReasonAboutSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
