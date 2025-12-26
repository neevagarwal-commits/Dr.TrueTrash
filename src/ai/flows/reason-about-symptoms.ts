'use server';
/**
 * @fileOverview AI agent for reasoning about symptoms and predicting potential health issues.
 * This flow simulates a classic machine learning model like a Decision Tree or Naive Bayes.
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
  prompt: `You are simulating a classic machine learning model (like a Decision Tree or Naive Bayes) for predicting health issues from symptoms.

You will receive a list of symptoms from the user. First, you will preprocess these symptoms by cleaning the data, handling any missing values, and extracting relevant features.

**IMPORTANT**: Your reasoning should mimic a simple, rule-based model. Do not use complex medical knowledge. Base your predictions strictly on the input features. For example, if the features are "fever" and "cough", a reasonable prediction is "Common Cold" or "Flu".

Symptoms: {{{symptoms}}}

Based on these symptoms, provide a list of potential health issues, their likelihood, and a simple, rule-based explanation for each prediction. Use the output schema to guide your response formatting.`, 
});

const reasonAboutSymptomsFlow = ai.defineFlow(
  {
    name: 'reasonAboutSymptomsFlow',
    inputSchema: ReasonAboutSymptomsInputSchema,
    outputSchema: ReasonAboutSymptomsOutputSchema,
  },
  async input => {
    // Combined preprocessing and prediction into a single AI call
    const {output} = await prompt(input);
    return output!;
  }
);
