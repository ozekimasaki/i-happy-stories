import { z } from 'zod';
 
export const storyRequestSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt cannot be empty.' }),
}); 