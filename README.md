# PrepPilot — AI Interview Coach

An AI chatbot that helps students prepare for interviews for four roles:

1. 🧭 **AI Product Manager**
2. 🎯 **Product Manager** (classic PM interviews)
3. 🚀 **AI Forward Deployed Engineer**
4. 🧠 **AI Engineer**

Built with **Vite + React (JavaScript)**. No backend: users sign in with their own API key, and every request goes straight from the browser to that provider.

## Features

- **🎓 Question series.** Each role has 3 modules of 3 questions each (36 in total). Every question comes with a hint, a written **model answer** and the **key points** interviewers listen for.
  - **🎙️ Voice evaluator.** Answer out loud. Your browser transcribes the answer live, and you can edit the transcript before submitting.
  - **Scoring.** The AI evaluator gives an overall score out of 10, a hire verdict and four sub-scores (content, structure, communication, depth). It lists which key points you covered and which you missed, gives strengths and improvements, rewrites your answer in an improved form, and suggests a likely follow-up question.
  - **Delivery metrics,** computed locally: duration, speaking pace in words per minute, and filler words ("um", "like", "you know"…).
  - **Progress.** The model answer stays hidden until you've tried the question. You can have the question read aloud, and your attempt history and best score are tracked for each question and module.
- **Sign in with an API key.** Choose from four providers: **Claude (recommended)**, ChatGPT (OpenAI), Gemini (Google) or Llama (Groq). The key is checked by listing the provider's models, and the model picker is filled from that list. You can connect more providers and switch between them later in ⚙️ Settings.
- **Practice chat** for each role, with a 🎙️ button for dictating answers. The coach asks realistic questions, scores your answer out of 10, points out what you missed, sketches a model answer and asks follow-ups. Quick prompts cover random, hard and behavioral questions, a 2‑week study plan and key concepts.
- **🔍 Deep dive** on any question. You get a full study guide: what the interviewer is testing, a 60‑second answer, the full answer, a worked example, common mistakes and likely follow-ups, plus **links**:
  - Claude and Gemini run a live **web search** and list the sources they used.
  - Every deep dive also shows curated resources for the role and search links (web, YouTube, arXiv).
  - Deep dives are cached, so reopening one costs nothing.
- **⭐ Saved questions**: your revision list, with a status for each question (To practice / Needs review / Confident), a progress bar, quick notes and the saved deep-dive answer.
- **📝 Notes**: Markdown notes with autosave, a preview mode, role tags, search and `.md` download. You can send any chat reply or deep dive to your notes in one click.
- **📚 Question bank**: hand-picked questions for each role, sorted by category and difficulty.
- A soft pastel design that adapts to light and dark mode and works on phones.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173, enter your name, pick a provider and paste your API key.

Production build:

```bash
npm run build
```

The `dist/` folder is a static site, so you can host it anywhere (Netlify, Vercel, GitHub Pages).

## Getting an API key

| Provider | Get a key | Notes |
|---|---|---|
| **Claude** (recommended) | https://platform.claude.com/settings/keys | Defaults to Claude Opus 5.5. Deep dives use web search with real citations. |
| ChatGPT | https://platform.openai.com/api-keys | |
| Gemini | https://aistudio.google.com/apikey | Deep dives use Google Search grounding. |
| Llama (Groq) | https://console.groq.com/keys | Fast, with a free tier. |

## Privacy and security

- Voice input uses the browser's built-in speech recognition, which works in Chrome, Edge and Safari. In Chrome, the audio is processed by the browser vendor's speech service. In browsers without speech recognition, students can type their answer instead. The app never stores audio, only the text transcript.

- Keys go **only** to the provider they belong to, sent directly from your browser.
- By default the key is kept in `sessionStorage`, so it is gone when you close the tab. Tick **Remember me** to keep it in `localStorage`. Don't do that on shared computers.
- Chats, saved questions and notes are stored in this browser's `localStorage` and kept separate for each name you sign in with.
- Since keys live in the browser, this setup suits personal use. For a public deployment with shared keys, add a small backend proxy.

## Project structure

```
src/
  App.jsx                 app shell, state, save/notes/deep-dive actions
  data/roles.js           roles, question banks, curated resources  ← edit to add content
  data/series.js          question series: modules, model answers, key points
  lib/speech.js           microphone speech-to-text + delivery metrics
  lib/evaluate.js         AI answer evaluator (rubric-based JSON scoring)
  lib/providers.js        the four providers and their default models
  lib/llm.js              streaming client for Claude (Anthropic SDK), OpenAI, Gemini, Groq
  lib/prompts.js          coach and deep-dive system prompts
  lib/storage.js          per-user localStorage persistence
  components/             Login, Sidebar, Series, AnswerRecorder, EvaluationCard, Chat,
                          DeepDive, QuestionBank, Saved, Notes, Settings
```

To swap a provider (for example DeepSeek or xAI instead of Groq), add it to `lib/providers.js` and a matching branch in `lib/llm.js`. Any OpenAI-compatible API only needs a new base URL in `OPENAI_COMPAT`.
