import { GoogleGenAI } from '@google/genai';
import type { Context } from 'hono';

// Define a type for the environment variables we need.
// This can be used by both Hono and the queue consumer.
type GeminiEnv = {
    GEMINI_API_KEY: string;
};

/**
 * Initializes the Gemini client directly from environment variables.
 * This version is independent of Hono's context and can be used in queue consumers.
 * @param env The environment object containing the API key.
 * @returns An instance of the GoogleGenAI client.
 */
export const initializeGeminiClientFromEnv = (env: GeminiEnv) => {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Gets the Gemini client using Hono's context.
 * This is a convenience wrapper around initializeGeminiClientFromEnv for use in Hono routes.
 * @param c The Hono context.
 * @returns An instance of the GoogleGenAI client.
 */
export const getGeminiClient = (c: Context<{ Bindings: GeminiEnv }>) => {
    return initializeGeminiClientFromEnv(c.env);
};