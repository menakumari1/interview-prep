# PrepIQ
AI-Powered Mock Interview Platform

PrepIQ is a real-time, full-stack AI voice interview platform built to help users practice and improve their interview skills. It simulates realistic interview environments using intelligent voice agents and offers instant feedback and performance analytics. The project combines cutting-edge technologies like Next.js, Firebase, Tailwind CSS, and Vapi AI to deliver a modern, scalable, and highly interactive experience.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
- [Environment Variables](#environment-variables)
- [Limitations](#limitations)
- [Future Scope](#future-scope)

---

## Demo

https://interview-prep-seven-blush.vercel.app/

## Features

- **Voice-based Mock Interviews** via Vapi AI
- **AI-Powered Feedback** on communication, technical depth, and more
- **Role, Level, and Tech Stack Based Interview Generation**
- **Real-time Transcription & Feedback**
- **Authentication & User Profiles via Firebase**
- **Modern UI/UX with Tailwind CSS and shadcn/ui**
- **Dashboard for Interview History and Analytics**
- Fully **Responsive Design**

---

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore), Node.js
- **AI & Voice**: Vapi AI, Google Gemini, GPT-4 (OpenAI), Deepgram
- **Validation**: Zod, React Hook Form
- **Others**: TypeScript, Radix UI, Lucide Icons

---

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

```bash
git clone https://github.com/yourusername/prepiq.git
cd prepiq
npm install
```

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Project Structure

```plaintext
app/            # Next.js pages and routes
components/     # Reusable UI & functional components
constants/      # Configuration and AI settings
firebase/       # Firebase admin/client setup
lib/            # Utils, SDKs, actions
types/          # TypeScript types
public/         # Static assets
```

---

## Core Modules

### Interview Engine

- Dynamic AI interviewer using GPT-4 and Vapi AI
- Real-time voice interaction and transcription
- Role-based question generation and feedback scoring

### Authentication

- Firebase email/password login
- Session management via cookies

### Feedback & Analytics

- Google Gemini for personalized performance evaluation
- Visual breakdown of communication, problem solving, confidence, etc.

---

## Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

NEXT_PUBLIC_VAPI_WEB_TOKEN=
GOOGLE_GENERATIVE_AI_API_KEY=
```

---

## Limitations

- Vapi AI token usage may incur cost depending on usage
- Requires reliable internet and microphone access
- Feedback accuracy depends on transcription quality

---

## Future Scope

- Add multi-language interview support
- Integrate resume-based question personalization
- Expand to include live interview coaching
- Add gamified learning and certifications
