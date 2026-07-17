# CAT — CA Tutor

A simple doubt-solving chatbot for Chartered Accountancy (CA) students, built on the Groq API.
Students pick a subject (Accounting, Law, Costing, Taxation, Auditing, Financial Management) and
ask a question; the backend calls Groq with a CA-tutor system prompt and returns a step-by-step
answer.

Groq's free tier requires no credit card and gives a generous daily request budget — a good fit if
you want to run this without spending anything. It serves open-weight models (Llama, etc.) rather
than a proprietary model like GPT or Claude, but quality on CA-style explanation and step-by-step
working is solid.

## How it works

- **`server.js`** — an Express server. It's the only place that holds your API key, and it forwards
  chat messages to Groq's OpenAI-compatible `/openai/v1/chat/completions` endpoint with a system
  prompt tuned for CA topics.
- **`public/index.html`** — the browser chat UI. It never talks to Groq directly; it only calls
  your own `/api/chat` endpoint.

Keeping the key on the server is important: if the browser called Groq directly, anyone could open
dev tools and steal your key.

Groq's free tier has rate limits (a cap on requests per minute and per day) rather than a spending
limit — if you hit them, wait a bit and try again rather than needing to pay.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env file and add your key:
   ```bash
   copy .env.example .env
   ```
   Then edit `.env` and paste your free key from https://console.groq.com/keys (sign up, no card
   needed, click "API Keys" then "Create API Key")
3. Start the server:
   ```bash
   npm start
   ```
4. Open http://localhost:3000 in your browser.

## Customizing

- **Change the subjects** — edit the `.subject` list in `public/index.html`.
- **Tune how it answers** — edit `SYSTEM_PROMPT` in `server.js` (e.g. add "always explain in Hindi +
  English" or "assume CA Intermediate new scheme").
- **Add your own study notes** — if you later want it to answer from your specific PDFs/notes rather
  than general knowledge, that's a bigger step (a "RAG" setup that searches your notes before
  answering). Happy to help with that separately when you have the material ready.
- **Swap the model** — `claude-sonnet-4-6` is a good default for quality/cost. You could add a
  cheaper/faster model for simple questions if you want to save on API costs at scale.

## Deploying

This is a plain Node/Express app, so it runs on most hosts (Render, Railway, Fly.io, a VPS, etc.).
Just set the `ANTHROPIC_API_KEY` environment variable on the host — don't commit your `.env` file.
