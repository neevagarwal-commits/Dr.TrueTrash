'use server';

import { reasonAboutSymptoms } from '@/ai/flows/reason-about-symptoms';
import type { Prediction } from '@/lib/types';

export async function getAiResponse(symptoms: string): Promise<{error?: string; predictions?: Prediction[]}> {
  try {
    const symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (symptomsArray.length === 0) {
      return { error: 'Please enter at least one symptom.' };
    }

    const result = await reasonAboutSymptoms({
      symptoms: symptomsArray,
    });

    if (!result.predictions || result.predictions.length === 0) {
      return { error: 'The AI could not determine any potential health issues from the symptoms provided. Please try describing them differently or consult a healthcare professional.' };
    }

    return { predictions: result.predictions };

  } catch (error) {
    console.error("AI action failed:", error);
    return { error: 'An unexpected error occurred while analyzing your symptoms. Please try again later.' };
  }
}
