'use server';

/**
 * @fileOverview A flow to evaluate the accuracy of the machine learning model's predictions.
 *
 * - evaluateModelAccuracy - A function that evaluates the accuracy of the ML model.
 * - EvaluateModelAccuracyInput - The input type for the evaluateModelAccuracy function.
 * - EvaluateModelAccuracyOutput - The return type for the evaluateModelAccuracy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateModelAccuracyInputSchema = z.object({
  validationData: z.string().describe('The validation dataset in JSON format.'),
  predictions: z.string().describe('The model predictions in JSON format.'),
});
export type EvaluateModelAccuracyInput = z.infer<typeof EvaluateModelAccuracyInputSchema>;

const EvaluateModelAccuracyOutputSchema = z.object({
  accuracyReport: z.string().describe('A detailed report on the model accuracy.'),
});
export type EvaluateModelAccuracyOutput = z.infer<typeof EvaluateModelAccuracyOutputSchema>;

export async function evaluateModelAccuracy(input: EvaluateModelAccuracyInput): Promise<EvaluateModelAccuracyOutput> {
  return evaluateModelAccuracyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateModelAccuracyPrompt',
  input: {schema: EvaluateModelAccuracyInputSchema},
  output: {schema: EvaluateModelAccuracyOutputSchema},
  prompt: `You are an AI expert specializing in evaluating the accuracy of machine learning models.

You will receive the validation dataset and the model predictions.

Compare the predictions against the validation data and provide a detailed accuracy report, including key metrics and observations.

Validation Data: {{{validationData}}}
Predictions: {{{predictions}}}

Ensure that the accuracy report is comprehensive and provides insights into the model's performance.
`,
});

const evaluateModelAccuracyFlow = ai.defineFlow(
  {
    name: 'evaluateModelAccuracyFlow',
    inputSchema: EvaluateModelAccuracyInputSchema,
    outputSchema: EvaluateModelAccuracyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
