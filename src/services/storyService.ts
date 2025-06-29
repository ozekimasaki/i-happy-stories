import { Context } from 'hono';
import { getSupabase } from '../lib/supabase';
import { getGeminiClient } from '../lib/geminiClient';
import { Story } from '../../types/hono';

export const createStory = async (c: Context, prompt: string): Promise<Story> => {
  try {
    const supabase = getSupabase(c);
    const user = c.get('user');

    if (!user) {
      throw new Error('User not found.');
    }
    
    console.log(`Generating story for prompt: "${prompt}"`);
    const genAI = getGeminiClient(c);
    
    const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `以下のプロンプトに基づいて、短い物語を創作してください。物語の最初の行がタイトルになります。

プロンプト: ${prompt}`
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No content generated or unexpected response structure.');
    }

    const lines = text.trim().split('\n');
    const title = lines[0];
    const content = lines.slice(1).join('\n').trim();

    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        title: title,
        content: content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving story to Supabase:', error);
      throw new Error('Failed to save story to database.');
    }

    return data as Story;

  } catch (error) {
    console.error('Error in createStory:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred while creating the story.');
  }
};

export const getStoriesByUserId = async (c: Context, userId: string) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      created_at,
      illustrations (
        id,
        image_url,
        prompt
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories from Supabase:', error);
    throw new Error(`Failed to fetch stories: ${error.message}`);
  }

  return data;
};

export const getStoryById = async (c: Context, storyId: number, userId: string) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      created_at,
      illustrations (
        id,
        image_url,
        prompt
      )
    `)
    .eq('id', storyId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error(`Error fetching story ${storyId} from Supabase:`, error);
    throw new Error(`Failed to fetch story: ${error.message}`);
  }

  return data;
}; 