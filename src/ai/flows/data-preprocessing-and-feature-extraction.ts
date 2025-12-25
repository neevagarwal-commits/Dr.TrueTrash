'use server';
/**
 * @fileOverview This file contains the data preprocessing and feature extraction flow.
 * It takes user-provided symptom data, cleans it, handles missing values, and extracts relevant features
 * to ensure it's suitable for the machine learning model, improving prediction accuracy.
 *
 * - dataPreprocessingAndFeatureExtraction - A function that handles the data preprocessing and feature extraction process.
 * - DataPreprocessingAndFeatureExtractionInput - The input type for the dataPreprocessingAndFeatureExtraction function.
 * - DataPreprocessingAndFeatureExtractionOutput - The return type for the dataPreprocessingAndFeatureExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataPreprocessingAndFeatureExtractionInputSchema = z.object({
  symptoms: z
    .string()
    .describe(
      'A comma separated list of symptoms provided by the user (e.g. fever,cough,fatigue)'
    ),
});
export type DataPreprocessingAndFeatureExtractionInput = z.infer<
  typeof DataPreprocessingAndFeatureExtractionInputSchema
>;

const DataPreprocessingAndFeatureExtractionOutputSchema = z.object({
  preprocessedData: z
    .string()
    .describe(
      'The preprocessed symptom data suitable for the machine learning model.'
    ),
  extractedFeatures: z
    .string()
    .describe(
      'The extracted features from the symptom data in a format suitable for the model.'
    ),
});
export type DataPreprocessingAndFeatureExtractionOutput = z.infer<
  typeof DataPreprocessingAndFeatureExtractionOutputSchema
>;

export async function dataPreprocessingAndFeatureExtraction(
  input: DataPreprocessingAndFeatureExtractionInput
): Promise<DataPreprocessingAndFeatureExtractionOutput> {
  return dataPreprocessingAndFeatureExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dataPreprocessingAndFeatureExtractionPrompt',
  input: {schema: DataPreprocessingAndFeatureExtractionInputSchema},
  output: {schema: DataPreprocessingAndFeatureExtractionOutputSchema},
  prompt: `You are an expert in data preprocessing for machine learning models.

You will receive a list of symptoms from the user. You need to:
1. Clean the data by removing any special characters or irrelevant information.
2. Handle missing values by replacing them with appropriate values or marking them as missing.
3. Extract relevant features from the symptom data in a format suitable for the machine learning model.

Symptoms: {{{symptoms}}}

Output the preprocessed data and extracted features in a clear and concise format.

Preprocessed Data:
Extracted Features:`,
});

const dataPreprocessingAndFeatureExtractionFlow = ai.defineFlow(
  {
    name: 'dataPreprocessingAndFeatureExtractionFlow',
    inputSchema: DataPreprocessingAndFeatureExtractionInputSchema,
    outputSchema: DataPreprocessingAndFeatureExtractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
