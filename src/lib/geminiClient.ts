import { GoogleGenAI } from '@google/genai';
import type { Context } from 'hono';

// HonoのContextから環境変数を取得し、Geminiクライアントを初期化して返す
export const getGeminiClient = (c: Context<{
    Bindings: {
        GEMINI_API_KEY: string;
    }
}>) => {
    const apiKey = c.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }

    return new GoogleGenAI({ apiKey });
};