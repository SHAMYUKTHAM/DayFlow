import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import { sendDailyReminderEmail } from './reminderEmailService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory persistent database store initialized with initial data
// (can be persisted or updated live through REST endpoints)
let users: any[] = [
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
    reminderSettings: {
      enabled: true,
      time: '20:30',
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      reminderType: 'both',
      timezone: 'Asia/Kolkata',
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
    reminderSettings: {
      enabled: true,
      time: '20:30',
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      reminderType: 'both',
      timezone: 'Asia/Kolkata',
    },
  };
  users.push(newUser);
  res.json({ success: true, user: newUser, token: 'dayflow-session-token-' + newUser.id });
});

app.get('/api/auth/me', (_req, res) => {
  res.json({ user: users[0] });
});

// Reminder Preferences & Email Dispatch Endpoints
app.post('/api/reminders/settings', (req, res) => {
  const { email, reminderSettings } = req.body;
  let user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    user = {
      id: 'user-' + Date.now(),
      email: email || 'user@example.com',
      name: email ? email.split('@')[0] : 'User',
      createdAt: new Date().toISOString(),
      preferences: {
        theme: 'light',
        defaultPriority: 'medium',
        enableSounds: true,
        autoSaveIntervalMs: 2000,
      },
      reminderSettings,
    };
    users.push(user);
  } else {
    user.reminderSettings = { ...user.reminderSettings, ...reminderSettings };
  }
  console.log(`[DayFlow Server] 💾 Saved reminder settings for ${user.email}: Time=${user.reminderSettings?.time}, Enabled=${user.reminderSettings?.enabled}`);
  res.json({ success: true, user, reminderSettings: user.reminderSettings });
});

app.post('/api/reminders/send-test', async (req, res) => {
  const { email, name, time, reminderType, tasks } = req.body;
  const targetEmail = email || users[0].email;
  console.log(`[DayFlow Server] 📨 Received test email request for ${targetEmail}`);
  try {
    const result = await sendDailyReminderEmail({
      to: targetEmail,
      name: name || 'DayFlow Member',
      time: time || '20:30',
      reminderType: reminderType || 'both',
      tasks: tasks || [],
      isTest: true,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to send test email' });
  }
});

app.get('/api/reminders/:email', (req, res) => {
  const user = users.find((u) => u.email.toLowerCase() === (req.params.email || '').toLowerCase());
  if (user && user.reminderSettings) {
    return res.json({ success: true, reminderSettings: user.reminderSettings });
  }
  res.json({
    success: true,
    reminderSettings: {
      enabled: true,
      time: '20:30',
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      reminderType: 'both',
      timezone: 'Asia/Kolkata',
    },
  });
});

// Periodic scheduler to check reminder times and send emails
setInterval(async () => {
  const now = new Date();
  for (const user of users) {
    if (!user.reminderSettings || !user.reminderSettings.enabled) continue;

    const { time, days, timezone, lastSentDate } = user.reminderSettings;
    if (!time) continue;

    let userHours = String(now.getHours()).padStart(2, '0');
    let userMinutes = String(now.getMinutes()).padStart(2, '0');
    let userDayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    let todayKey = now.toISOString().slice(0, 10);

    if (timezone) {
      try {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          weekday: 'short',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).formatToParts(now);

        const h = parts.find((p) => p.type === 'hour')?.value;
        const m = parts.find((p) => p.type === 'minute')?.value;
        const wd = parts.find((p) => p.type === 'weekday')?.value?.toLowerCase();
        const yr = parts.find((p) => p.type === 'year')?.value;
        const mo = parts.find((p) => p.type === 'month')?.value;
        const dy = parts.find((p) => p.type === 'day')?.value;

        if (h && m) {
          userHours = h === '24' ? '00' : h.padStart(2, '0');
          userMinutes = m.padStart(2, '0');
        }
        if (wd) userDayName = wd.slice(0, 3);
        if (yr && mo && dy) todayKey = `${yr}-${mo}-${dy}`;
      } catch (e) {
        // Fallback to server local time
      }
    }

    const currentFormattedTime = `${userHours}:${userMinutes}`;
    const dayMatches = !days || days.length === 0 || days.includes(userDayName);

    if (dayMatches && currentFormattedTime === time && lastSentDate !== todayKey) {
      user.reminderSettings.lastSentDate = todayKey;
      console.log(`[DayFlow Scheduler] ⏰ Daily reminder triggered for ${user.email} at ${currentFormattedTime} (${userDayName})`);
      try {
        await sendDailyReminderEmail({
          to: user.reminderSettings.customEmail || user.email,
          name: user.name,
          time: user.reminderSettings.time,
          reminderType: user.reminderSettings.reminderType || 'both',
          isTest: false,
        });
      } catch (err) {
        console.error(`[DayFlow Scheduler] Error delivering scheduled email to ${user.email}:`, err);
      }
    }
  }
}, 30000);

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
