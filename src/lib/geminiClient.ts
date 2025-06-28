import { GoogleGenAI } from '@google/genai';
import { Context } from 'hono';

// Honoの型定義から環境変数を取得する方法を模索
// wrangler.toml や .dev.vars から読み込まれる変数の型定義が必要
type Env = {
    Bindings: {
        GEMINI_API_KEY: string;
    }
}

// このアプローチはCloudflare Workersのランタイムでのみ機能する可能性が高い
// ここではHonoのContextから直接取得するのではなく、
// サーバーサイドでプロセス環境変数として読み込むことを想定する

// 注：Cloudflare Workers環境では c.env.GEMINI_API_KEY のようにアクセスする
// ここではHonoのリクエストコンテキスト外で初期化するため、
// c.env を直接使えない。
// そのため、一度Honoの型定義だけを参考にし、キーを直接取得する関数を定義する

const getApiKey = (c: any): string => {
    if (c && c.env && c.env.GEMINI_API_KEY) {
        return c.env.GEMINI_API_KEY;
    }
    // Cloudflare環境でない場合（ローカルテストなど）はprocess.envを参照
    if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
        return process.env.GEMINI_API_KEY;
    }
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
};


// HonoのContextから環境変数を取得し、Geminiクライアントを初期化して返す
export const getGeminiClient = (c: Context) => {
    const apiKey = c.env.GEMINI_API_KEY as string | undefined;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }

    return new GoogleGenAI({ apiKey });
}; 