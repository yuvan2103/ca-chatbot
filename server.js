// server.js — backend for the CA Doubt-Solver chatbot
// Keeps the Groq API key on the server; the browser never sees it.
// Groq has a genuinely free tier (no card required) with generous daily limits.

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are a patient, precise tutor for Indian Chartered Accountancy (CA) students,
covering CA Foundation, Intermediate, and Final level subjects: Accounting, Corporate & Other Laws,
Costing, Taxation (Direct & Indirect), Auditing & Assurance, Financial Management, and Strategic
Management. When answering:
- Give step-by-step working for numerical problems (journal entries, ledgers, computations), not just
  the final answer.
- Reference the relevant standard, section, or concept by name (e.g. "AS 10", "Section 143 of the
  Companies Act") when it helps the student locate it in their study material, but do not claim to
  quote ICAI study material verbatim.
- If a question is ambiguous (e.g. which attempt/syllabus, old vs new scheme), ask a brief clarifying
  question before solving.
- Keep tone encouraging and exam-focused. Where useful, note common mistakes students make on that
  topic.
- If asked something outside CA studies, answer briefly and helpfully anyway.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Groq's API is OpenAI-compatible, so the request/response shape is identical —
  // just a different base URL, key, and model name.
  const openaiMessages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        // llama-3.3-70b-versatile is Groq's best free-tier quality/speed balance.
        // Swap to 'llama-3.1-8b-instant' if you need higher request-per-day limits
        // and can accept slightly lower answer quality.
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: openaiMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

app.listen(PORT, () => {
  console.log(`CA Doubt-Solver running at http://localhost:${PORT}`);
});
