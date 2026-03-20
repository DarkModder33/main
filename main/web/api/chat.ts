import type { VercelRequest, VercelResponse } from '@vercel/node';
import aiChatHandler from './ai/chat.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return aiChatHandler(req, res);
}

