'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Send, MessageCircle } from 'lucide-react';
import RefundForm from '@/components/refund-form';
import ChatMessages from '@/components/chat-messages';
import SampleQuestions from '@/components/sample-questions';
import { sampleQuestions } from '@/lib/knowledge-base';

export default function Page() {
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }>>([]);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);

    // Initial greeting
    const initialMessage = {
      id: uuidv4(),
      role: 'assistant' as const,
      content: `Welcome to Customer Support! I'm here to help you with refund requests. Our refund policy allows returns within 30 days of purchase for qualifying items (45 days for loyalty members).

What can I help you with today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    // Hide sample questions after first message
    setShowQuestions(false);

    const userMessage = {
      id: uuidv4(),
      role: 'user' as const,
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/refund/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: content,
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);

      // Show form if user mentions refund
      if (content.toLowerCase().includes('refund') || content.toLowerCase().includes('return')) {
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: uuidv4(),
      role: 'assistant' as const,
      content,
      timestamp: new Date().toISOString(),
    }]);
  };

  const handleSubmitRefund = async (customerId: string, orderId: string, reason: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/refund/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          orderId,
          reason,
        }),
      });

      const data = await response.json();

      if (data.approved) {
        addAssistantMessage(`Your refund request has been processed!

**Refund Details:**
- Amount: $${data.amount}
- Reference ID: ${data.requestId}
- Status: APPROVED
- Processing Time: ${data.processingTime}

Your refund will be credited back to your original payment method shortly. Thank you for your business!`);
      } else {
        addAssistantMessage(`Unfortunately, your refund request was not approved. Reason: ${data.reason}

If you believe this is incorrect, please contact our support team for further assistance.`);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error processing refund:', error);
      addAssistantMessage('Sorry, there was an error processing your refund. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (inputRef.current?.value.trim()) {
      sendMessage(inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="px-6 py-5 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
              <MessageCircle className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Customer Support</h1>
              <p className="text-sm text-muted-foreground">AI-powered refund assistant with Groq Llama 4</p>
            </div>
          </div>
          <Button asChild size="sm" className="shadow-sm">
            <a href="/admin">Admin Dashboard</a>
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 bg-background">
        <div className="p-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            <ChatMessages messages={messages} />
            
            {/* Sample Questions Section */}
            {showQuestions && messages.length === 1 && (
              <Card className="p-6 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <SampleQuestions
                  questions={sampleQuestions}
                  onSelectQuestion={sendMessage}
                  disabled={loading}
                />
              </Card>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Form Section */}
      {showForm && (
        <div className="border-t border-border bg-card p-6 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <RefundForm onSubmit={handleSubmitRefund} loading={loading} />
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="border-t border-border bg-card p-6 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message or ask about refunds..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handleSendMessage();
              }
            }}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading}
            size="lg"
            className="px-6"
          >
            {loading ? 'Processing...' : <>Send <Send className="size-4 ml-2" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}
