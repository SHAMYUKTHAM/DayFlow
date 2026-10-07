import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory persistent database store initialized with initial data
// (can be persisted or updated live through REST endpoints)
let users = [
  {
    id: 'user-shamyuktha',
    name: 'Shamyuktha',
    email: 'shamyuktham6006@gmail.com',
    role: 'Student & Developer',
    createdAt: '2026-09-01T08:00:00Z',
    preferences: {
      theme: 'light',
      defaultPriority: 'medium',
      enableSounds: true,
      autoSaveIntervalMs: 2000,
    },
  },
];

// Initialize GenAI client if GEMINI_API_KEY is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', app: 'DayFlow', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || users[0];
  res.json({ success: true, user, token: 'dayflow-session-token-' + user.id });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: 'user-' + Date.now(),
    name: name || 'DayFlow User',
    email: email || 'user@example.com',
    role: 'Journaler & Creator',
    createdAt: new Date().toISOString(),
    preferences: {
      theme: 'light' as const,
      defaultPriority: 'medium' as const,
      enableSounds: true,
      autoSaveIntervalMs: 2000,
    },
  };
  users.push(newUser);
  res.json({ success: true, user: newUser, token: 'dayflow-session-token-' + newUser.id });
});

app.get('/api/auth/me', (_req, res) => {
  res.json({ user: users[0] });
});

// Optional AI Daily Reflection & Summary Endpoint
app.post('/api/ai/daily-summary', async (req, res) => {
  const { date, tasks, diary, mood } = req.body;

  const completed = (tasks || []).filter((t: any) => t.status === 'completed');
  const pending = (tasks || []).filter((t: any) => t.status !== 'completed');

  if (aiClient) {
    try {
      const prompt = `You are a calm, supportive, concise personal reflection companion in the DayFlow app.
Given the user's day:
Date: ${date}
Mood: ${mood || 'Not specified'}
Completed Tasks (${completed.length}): ${completed.map((t: any) => t.title).join(', ') || 'None'}
Pending Tasks (${pending.length}): ${pending.map((t: any) => t.title).join(', ') || 'None'}
Diary Excerpt: "${(diary?.content || '').replace(/<[^>]*>/g, '').slice(0, 500)}"

Please provide:
1. A warm, 2-3 sentence daily summary synthesizing what was planned vs experienced.
2. Two thoughtful, personalized reflection questions for tomorrow.
Keep the tone encouraging, calm, and grounded (like Notion/Linear journaling, not overly cheerful or cheesy). Return JSON with keys: "summary" and "questions" (array of strings).`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ success: true, ...parsed });
      }
    } catch (err: any) {
      console.warn('AI summary generation error:', err?.message || err);
    }
  }

  // Graceful high-quality non-AI algorithmic synthesis fallback
  const total = (tasks || []).length;
  const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
  const summary = total > 0
    ? `You completed ${completed.length} of ${total} planned tasks (${rate}%) today. ${
        completed.length >= 3
          ? 'You maintained steady momentum across your key commitments.'
          : 'A focused day with meaningful deliberate steps forward.'
      }`
    : 'A fresh, open day to reflect on your thoughts and build healthy habits.';

  const questions = [
    'What single accomplishment gave you the greatest feeling of progress today?',
    'What is one task or priority you want to give your best morning energy to tomorrow?',
  ];

  return res.json({ success: true, summary, questions });
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`DayFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
