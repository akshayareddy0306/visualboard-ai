import dotenv from 'dotenv';
dotenv.config();

// ONE constant GEMINI_MODEL per requirements
export const GEMINI_MODEL = 'gemini-3.8-flash';

export const PORT = parseInt(process.env.PORT || '5001', 10);
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
