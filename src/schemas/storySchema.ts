import { z } from 'zod';
 
export const storyRequestSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt cannot be empty.' }),
  age: z.enum(['1-2歳', '3-4歳', '5-6歳', '7-8歳', '9-10歳', '11-12歳'], { required_error: '対象年齢を選択してください。' }),
  length: z.enum(['very_short', 'short', 'medium', 'long', 'very_long'], { required_error: '物語の長さを選択してください。' }),
});

export const storyUpdateSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは1文字以上で入力してください。' }),
  content: z.string().min(1, { message: '本文は1文字以上で入力してください。' }),
});

export const audioRequestSchema = z.object({
  voice: z.string().min(1, { message: '話者を選択してください。' }),
}); 