export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RefundDecision {
  approved: boolean;
  amount: number;
  reason: string;
  toolCalls: ToolCall[];
}

export interface ToolCall {
  name: string;
  input: Record<string, any>;
  output: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  customerId?: string;
  messages: Message[];
  decision?: RefundDecision;
  createdAt: string;
  updatedAt: string;
}
