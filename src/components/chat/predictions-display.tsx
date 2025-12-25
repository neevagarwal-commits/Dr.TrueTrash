import type { Prediction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface PredictionsDisplayProps {
  predictions: Prediction[];
}

const getLikelihoodProps = (likelihood: string) => {
  const lowerLikelihood = likelihood.toLowerCase();
  if (lowerLikelihood.includes('high')) {
    return { variant: 'destructive' as const, icon: <AlertCircle className="h-4 w-4" /> };
  }
  if (lowerLikelihood.includes('medium')) {
    return { variant: 'secondary' as const, icon: <ShieldAlert className="h-4 w-4" /> };
  }
  return { variant: 'outline' as const, icon: <CheckCircle className="h-4 w-4" /> };
};

export default function PredictionsDisplay({ predictions }: PredictionsDisplayProps) {
  return (
    <div className="space-y-4">
      <p className="font-medium">Based on your symptoms, here are some potential health issues. This is not a medical diagnosis.</p>
      {predictions.map((prediction, index) => {
        const { variant, icon } = getLikelihoodProps(prediction.likelihood);
        return (
          <Card key={index} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-headline">{prediction.healthIssue}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                Likelihood:
                <Badge variant={variant} className="flex items-center gap-1">
                  {icon}
                  {prediction.likelihood}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-sm">View Explanation</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {prediction.explanation}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
       <p className="text-xs text-muted-foreground pt-4">Disclaimer: HealthWise AI provides potential insights based on symptoms and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
    </div>
  );
}
