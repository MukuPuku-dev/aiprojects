import fs from 'node:fs';
import path from 'node:path';
import { buildGeminiCaption, createSocialPostService } from './social-service.mjs';
import { DEFAULT_TELEGRAM_BOT_TOKEN, DEFAULT_TELEGRAM_CHAT_ID, readSettings } from './flow-settings.mjs';

// ============================================================================
// TELEGRAM BOT CONFIGURATION
// Paste your BotFather token in API_TOKEN below, OR enter it in the Story Studio
// / Flow Settings UI (saved in tools/flow/settings.json).
// ============================================================================
export const API_TOKEN = '9070921190:AAENc-X0hY_Hv11DD6MoVAhY5gPKqH7b8mE';
export const CHAT_ID = '7223190114';
export const PATH = 'video or image path or like a.mp4'; // Ensure this file exists in your folder

export const TELEGRAM_MAX_CAPTION_LENGTH = 1024;
export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

function isConfiguredToken(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return Boolean(trimmed && trimmed !== DEFAULT_TELEGRAM_BOT_TOKEN && trimmed !== 'PASTE_YOUR_BOTFATHER_TOKEN_HERE');
}

function isConfiguredChatId(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const trimmed = String(value).trim();
  return Boolean(trimmed && trimmed !== 'PASTE_YOUR_USERINFOBOT_ID_HERE');
}

export function resolveTelegramConfig({ botToken, chatId } = {}) {
  let savedTelegram = {};
  try {
    savedTelegram = readSettings()?.defaults?.telegram || {};
  } catch {}

  const tokenCandidates = [
    botToken,
    savedTelegram.botToken,
    process.env.TELEGRAM_BOT_TOKEN,
    API_TOKEN
  ];
  const token = tokenCandidates.find(isConfiguredToken)?.trim() || '';

  const chatIdCandidates = [
    chatId,
    savedTelegram.chatId,
    process.env.TELEGRAM_CHAT_ID,
    CHAT_ID,
    DEFAULT_TELEGRAM_CHAT_ID
  ];
  const resolvedChatId = String(chatIdCandidates.find(isConfiguredChatId) || DEFAULT_TELEGRAM_CHAT_ID).trim();

  return { token, chatId: resolvedChatId };
}

export function createTelegramService(root, { generateCaption = captionFromGemini, upload = uploadToTelegram } = {}) {
  return createSocialPostService({
    root,
    platform: 'Telegram',
    recordFileName: 'telegram-posts.json',
    generateCaption,
    upload
  });
}

export async function captionFromGemini(context, project) {
  return buildGeminiCaption(context, project, 'TikTok');
}

export async function uploadToTelegram({ file, caption = '', beforePost, botToken, chatId }) {
  const { token, chatId: targetChatId } = resolveTelegramConfig({ botToken, chatId });
  if (!token) {
    throw new Error('Telegram Bot Token is not configured. Paste your BotFather token in Flow Settings or in tools/flow/telegram.mjs (API_TOKEN) and retry.');
  }
  if (!targetChatId) {
    throw new Error('Telegram Chat ID is not configured.');
  }
  if (!file || !fs.existsSync(file) || !fs.lstatSync(file).isFile()) {
    throw new Error(`Media file not found: ${file}`);
  }

  const ext = path.extname(file).toLowerCase();
  const isImage = ext === '.png' || ext === '.jpg' || ext === '.jpeg';
  const method = isImage ? 'sendPhoto' : 'sendVideo';
  const fieldName = isImage ? 'photo' : 'video';
  const mime = ext === '.png' ? 'image/png' : isImage ? 'image/jpeg' : 'video/mp4';
  const url = `https://api.telegram.org/bot${token}/${method}`;

  const trimmedCaption = (caption || '').trim();
  const mediaCaption = trimmedCaption.length > TELEGRAM_MAX_CAPTION_LENGTH
    ? `${trimmedCaption.slice(0, TELEGRAM_MAX_CAPTION_LENGTH - 1)}…`
    : trimmedCaption;

  const form = new FormData();
  form.append('chat_id', targetChatId);
  const bytes = fs.readFileSync(file);
  form.append(fieldName, new Blob([bytes], { type: mime }), path.basename(file));
  if (mediaCaption) {
    form.append('caption', mediaCaption);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(180000)
  });

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Telegram returned invalid JSON (HTTP ${response.status}).`);
  }
  if (!response.ok || !body?.ok) {
    throw new Error(`Telegram API: ${body?.description || `HTTP ${response.status}`}`);
  }

  beforePost?.();

  if (trimmedCaption.length > TELEGRAM_MAX_CAPTION_LENGTH) {
    const messageUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const messagePayload = {
      chat_id: targetChatId,
      text: trimmedCaption.slice(0, TELEGRAM_MAX_MESSAGE_LENGTH),
      ...(body.result?.message_id ? { reply_to_message_id: body.result.message_id } : {})
    };
    await fetch(messageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload),
      signal: AbortSignal.timeout(60000)
    }).catch(err => console.error(`Telegram follow-up caption warning: ${err.message}`));
  }

  return body.result;
}
