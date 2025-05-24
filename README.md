# PrepIQ

AI-powered Mock Interview Platform

## Overview
PrepIQ is a premium, modern mock interview platform powered by AI. It helps users prepare for technical, behavioral, and mixed interviews with realistic, interactive sessions and instant feedback.

- **Tech Stack:** Next.js, React, Tailwind CSS, Firebase (Google Auth, Firestore)
- **Features:**
  - Google authentication (Firebase)
  - AI-driven interviewer with voice and text
  - Real-time feedback and scoring
  - Premium, glassmorphism-inspired UI/UX
  - Interview history and feedback storage (Firestore)
  - User profile menu with logout

## Screenshots
![PrepIQ Screenshot](public/kawaai_robot.png)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Firebase project (for Auth and Firestore)

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file with your Firebase credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Running Locally
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Deployment
You can deploy PrepIQ to Vercel, Netlify, or any platform that supports Next.js.

## Folder Structure
- `app/` — Next.js app directory (routes, layouts, pages)
- `components/` — Reusable UI and logic components
- `lib/` — Utilities, Firebase, and API logic
- `public/` — Static assets (images, icons)
- `types/` — TypeScript types

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

---

Made with ❤️ by Mena Kumari and contributors.