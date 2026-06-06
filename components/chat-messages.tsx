import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-xl`}>
            {/* Avatar */}
            <div className={cn(
              'size-9 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm',
              message.role === 'user' 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-200'
            )}>
              {message.role === 'user' ? (
                <MessageCircle className="size-5" />
              ) : (
                <Bot className="size-5" />
              )}
            </div>

            {/* Message Content */}
            <div className="flex flex-col gap-1">
              <div className={cn(
                'px-4 py-3 rounded-2xl',
                message.role === 'user'
                  ? 'bg-accent text-accent-foreground rounded-br-sm shadow-md'
                  : 'bg-card border border-border text-foreground rounded-bl-sm shadow-sm'
              )}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
              <p className="text-xs text-muted-foreground px-2">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
