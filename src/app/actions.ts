'use server';

import { chatWithLogs } from '@/ai/flows/chat-with-logs';
import { z } from 'zod';

const chatSchema = z.object({
  question: z.string(),
  logs: z.string(),
});

export async function getAiAnswer(formData: FormData) {
  const validatedFields = chatSchema.safeParse({
    question: formData.get('question'),
    logs: formData.get('logs'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await chatWithLogs(validatedFields.data);
    return { answer: result.answer };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to get a response from AI.' };
  }
}
