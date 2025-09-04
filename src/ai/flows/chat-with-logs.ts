'use server';

/**
 * @fileOverview An AI agent for chatting with logs, using ChromaDB for vector embeddings.
 *
 * - chatWithLogs - A function that handles chatting with logs and retrieves insights.
 * - ChatWithLogsInput - The input type for the chatWithLogs function.
 * - ChatWithLogsOutput - The return type for the chatWithLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithLogsInputSchema = z.object({
  question: z.string().describe('The question to ask about the logs.'),
  logs: z.string().describe('The log data to analyze.'),
});
export type ChatWithLogsInput = z.infer<typeof ChatWithLogsInputSchema>;

const ChatWithLogsOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question about the logs.'),
});
export type ChatWithLogsOutput = z.infer<typeof ChatWithLogsOutputSchema>;

export async function chatWithLogs(input: ChatWithLogsInput): Promise<ChatWithLogsOutput> {
  return chatWithLogsFlow(input);
}

const chatWithLogsPrompt = ai.definePrompt({
  name: 'chatWithLogsPrompt',
  input: {schema: ChatWithLogsInputSchema},
  output: {schema: ChatWithLogsOutputSchema},
  prompt: `You are an AI assistant that helps users analyze log data.\n\n  Use the following log data to answer the user's question. Be concise and specific, and cite specific log entries if helpful.\n\n  Logs: {{{logs}}}\n\n  Question: {{{question}}}`,
});

const chatWithLogsFlow = ai.defineFlow(
  {
    name: 'chatWithLogsFlow',
    inputSchema: ChatWithLogsInputSchema,
    outputSchema: ChatWithLogsOutputSchema,
  },
  async input => {
    const {output} = await chatWithLogsPrompt(input);
    return output!;
  }
);
