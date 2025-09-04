"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { getAiAnswer } from '@/app/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  activeLogContent: string;
  onHighlightLines: (lines: number[]) => void;
}

export function AIChat({ activeLogContent, onHighlightLines }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('question', input);
    formData.append('logs', activeLogContent.slice(-15000)); // Limit context size
    
    const result = await getAiAnswer(formData);

    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: result.error,
      });
      setMessages(messages);
    } else if (result.answer) {
      setMessages([...newMessages, { role: 'assistant', content: result.answer }]);
      
      const lineNumbers = result.answer.match(/line[s]?\s*(\d+)/gi)
        ?.map(match => parseInt(match.replace(/line[s]?\s*/i, ''), 10))
        .filter(n => !isNaN(n)) || [];
      if (lineNumbers.length > 0) {
        onHighlightLines(lineNumbers);
      }
    }
  };

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full rounded-lg">
      <h3 className="text-md font-semibold mb-2 flex items-center gap-2 shrink-0">
        <Bot className="text-primary h-5 w-5" />
        AI Assistant
      </h3>
      <ScrollArea className="flex-1 -mx-4" ref={scrollAreaRef}>
        <div className="px-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
              </Avatar>
            )}
            <div className={`p-3 rounded-lg max-w-[85%] ${message.role === 'assistant' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
             {message.role === 'user' && (
              <Avatar className="w-8 h-8">
                <AvatarFallback><User size={20} /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                 <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-secondary flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
        )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 shrink-0">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about the logs..."
          className="flex-1 resize-none bg-secondary"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
