export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
};

export type Prediction = {
  healthIssue: string;
  likelihood: string;
  explanation: string;
};
