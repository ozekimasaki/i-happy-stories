import { Context } from 'hono';
import { getGeminiClient } from '../lib/geminiClient';

export const generateStory = async (c: Context, prompt: string): Promise<string> => {
  try {
    console.log(`Generating story for prompt: "${prompt}"`);
    const genAI = getGeminiClient(c);
    
    const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
    });

    // オプショナルチェイニングとNull合体演算子で安全にテキストを抽出
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      return text;
    } else {
      throw new Error('No content generated or unexpected response structure.');
    }

  } catch (error) {
    console.error('Error generating story with Gemini:', error);
    // エラーを呼び出し元に伝播させて、ルートハンドラで処理する
    throw new Error('Failed to generate story using Gemini API.');
  }
}; 