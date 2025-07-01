import { Context } from 'hono';
import { getGeminiClient } from '../lib/geminiClient';
import { getSupabase } from '../lib/supabase';
import { Illustration } from '../../types/hono';

// Base64文字列をArrayBufferにデコードするヘルパー関数
const base64ToAb = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * 物語のプロンプトを受け取り、それに基づいたイラストを生成して保存する
 * @param c Honoのコンテキスト
 * @param storyId 親となる物語のID
 * @param prompt イラスト生成の指示を含むプロンプト
 * @returns 生成・保存されたイラストの情報
 */
export const createIllustration = async (c: Context, storyId: number, prompt: string): Promise<Illustration> => {
  try {
    console.log(`Creating illustration for story ${storyId} with prompt: "${prompt}"`);
    const supabase = getSupabase(c);
    const user = c.get('user');
    if (!user) {
      throw new Error('User not found.');
    }

    // 1. イラストを生成
    const genAI = getGeminiClient(c);
    const response = await genAI.models.generateImages({
        model: 'imagen-4.0-ultra-generate-preview-06-06',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: '16:9',
        },
    });

    const imageBase64 = response?.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBase64) {
      throw new Error('No illustration generated or unexpected response structure.');
    }

    // 2. Base64をデコードしてSupabase Storageにアップロード
    const imageBody = base64ToAb(imageBase64);
    const filePath = `${user.id}/${storyId}/${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('illustrations')
      .upload(filePath, imageBody, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading illustration to Storage:', uploadError);
      throw new Error('Failed to upload illustration.');
    }

    // 3. アップロードした画像の公開URLを取得
    const { data: publicUrlData } = supabase.storage
      .from('illustrations')
      .getPublicUrl(filePath);

    if (!publicUrlData) {
        throw new Error('Failed to get public URL for illustration.');
    }
    const imageUrl = publicUrlData.publicUrl;

    // 4. イラスト情報をデータベースに保存
    const { data, error: dbError } = await supabase
      .from('illustrations')
      .insert({
        story_id: storyId,
        image_url: imageUrl,
        prompt: prompt,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving illustration to DB:', dbError);
      throw new Error('Failed to save illustration data.');
    }

    return data as Illustration;

  } catch (error) {
    console.error('Error in createIllustration:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred while creating the illustration.');
  }
}; 