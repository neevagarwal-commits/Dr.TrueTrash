'use server';

import { evaluateModelAccuracy } from '@/ai/flows/evaluate-model-accuracy';

interface AccuracyData {
  validationData: string;
  predictions: string;
}

export async function checkAccuracy(data: AccuracyData): Promise<string> {
  try {
    const result = await evaluateModelAccuracy({
      validationData: data.validationData,
      predictions: data.predictions,
    });
    return result.accuracyReport;
  } catch (error) {
    console.error("Accuracy check failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to evaluate model accuracy: ${error.message}`);
    }
    throw new Error('Failed to evaluate model accuracy. Please check your data and try again.');
  }
}
