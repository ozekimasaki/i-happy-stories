import { z } from 'zod';
 
export const storyRequestSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt cannot be empty.' }),
});

export const storyUpdateSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは1文字以上で入力してください。' }),
  content: z.string().min(1, { message: '本文は1文字以上で入力してください。' }),
});

export const audioRequestSchema = z.object({
  voice: z.string().min(1, { message: '話者を選択してください。' }),
}); 