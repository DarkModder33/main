/**
 * TradeHax Session API Handler
 * GET/POST/PUT sessions and conversation history
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors, ensureAllowedMethods, handleOptions } from '../_shared/http.js';
import {
  appendSessionMessage,
  createUserSession,
  fetchRecentSessionMessages,
  fetchSession,
  saveSignalOutcome,
  updateSessionProfile,
} from './session-service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res, { methods: 'GET,POST,PUT,OPTIONS' });
  // Restrict CORS in production
  const allowedOrigins = [
    'https://www.tradehax.net',
    'https://vallcallya-p4dktjyoj-digitaldynasty.vercel.app',
  ];
  const origin = req.headers.origin || '';
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-API-Key');

  if (handleOptions(req, res)) {
    return;
  }

  if (!ensureAllowedMethods(req, res, ['GET', 'POST', 'PUT'])) {
    return;
  }

  // Require API key for POST/PUT in production
  if (isProd && (req.method === 'POST' || req.method === 'PUT')) {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
    if (!apiKey || apiKey !== process.env.TRADEHAX_ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const { action, sessionId } = req.query;

    // Create new session
    if (req.method === 'POST' && action === 'create') {
      const { userId } = req.body || {};
      const session = createUserSession(userId);
      return res.status(201).json(session);
    }

    // Get session
    if (req.method === 'GET' && sessionId && typeof sessionId === 'string') {
      const session = fetchSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      return res.status(200).json(session);
    }

    // Add message to session
    if (req.method === 'POST' && sessionId && typeof sessionId === 'string' && action === 'message') {
      const session = fetchSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      const { role, content, metadata } = req.body || {};
      if (!role || !content) {
        return res.status(400).json({ error: 'role and content required' });
      }
      const message = appendSessionMessage(sessionId, { role, content, metadata });
      return res.status(201).json(message);
    }

    // Get recent messages
    if (req.method === 'GET' && sessionId && typeof sessionId === 'string' && action === 'messages') {
      const { count } = req.query;
      const messages = fetchRecentSessionMessages(sessionId, parseInt(String(count || '8'), 10));
      return res.status(200).json({ messages });
    }

    // Record signal outcome
    if (req.method === 'PUT' && sessionId && typeof sessionId === 'string' && action === 'outcome') {
      const { messageId, outcome, profitLoss, assetSymbol } = req.body || {};
      if (!messageId || !outcome || !assetSymbol) {
        return res.status(400).json({ error: 'messageId, outcome, assetSymbol required' });
      }
      const success = saveSignalOutcome(sessionId, messageId, outcome, profitLoss || 0, assetSymbol);
      if (!success) {
        return res.status(404).json({ error: 'Session or message not found' });
      }
      const session = fetchSession(sessionId);
      return res.status(200).json(session);
    }

    // Update session profile
    if (req.method === 'PUT' && sessionId && typeof sessionId === 'string' && action === 'profile') {
      const session = fetchSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      const updates = req.body || {};
      const updated = updateSessionProfile(sessionId, updates);
      return res.status(200).json(updated);
    }

    return res.status(400).json({ error: 'Invalid action or missing parameters' });
  } catch (error: any) {
    console.error('Session API error:', error);
    return res.status(500).json({
      error: 'Session API error',
      message: error.message,
    });
  }
}
