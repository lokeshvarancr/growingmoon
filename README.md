# 🌙 Growing Moon

> **Helping people find someone ahead of them on their journey.**  
> A platform for builders, learners, and explorers to document authentic milestones, daily breakthroughs, and real setbacks.

---

## ✨ Overview

**Growing Moon** is a social platform built for early-stage founders, learners, and creators. Unlike traditional platforms optimized for vanity metrics, Growing Moon focuses on transparent journey tracking — allowing people to document their real steps, discover peer journeys, connect with collaborators, and learn from those just a few steps ahead.

---

## 🚀 Key Features

### 1. 🔍 Explore Feed (`/explore` & `/discover`)
- **Responsive Masonry Layout:** 2-column mobile editorial layout (tall-hero, top-image, white-minimal, and video cards) and a 4-column desktop card grid.
- **Category Filtering & Search:** Real-time filtering across *Building*, *Learning*, *Creativity*, *Career*, *Fitness*, and *Lifestyle* with server-side text search.
- **Live Database Connection:** Directly queries public milestone entries from PostgreSQL/Supabase with zero mock data.

### 2. 📝 Journey Milestone Updates (`/updates/[id]` & `/updates/new`)
- **Rich Milestone Composer:** Post updates with media attachments, journey tags, and reflective prompt questions.
- **Interactive Engagement:** 
  - **Fuel:** Show genuine encouragement.
  - **Bookmark / Save:** Curate inspiring milestones into your personal library.
  - **Community Advice Threads:** Peer discussions with **"Helpful"** and **"Applied"** peer validation voting.

### 3. 🛂 Journey Passports (`/passport/[username]`)
- **Chronological Timeline:** Visual timeline of milestones, pivots, lessons learned, and evidence-backed achievements.
- **Instant QR Code Sharing:** Dynamic QR code generation for in-person sharing and profile links.
- **Evidence Verification:** Supports self-reported vs. evidence-backed milestone logs with live verification links.

### 4. 👤 Public Profiles (`/profile/[username]`)
- Comprehensive builder profiles highlighting:
  - *"I can help with"*
  - *"I am figuring out"*
  - *"I am open to"*
  - **3 Current Focus Areas**
- Social follow/unfollow and 1-on-1 connection requests.

### 5. 💬 Real-Time Messaging (`/messages`)
- Direct peer-to-peer conversations.
- Real-time messaging powered by **Supabase WebSocket Channels**.

### 6. 🔔 Notifications & Activity Audit (`/notifications` & `/activity`)
- Notification center for connection requests, fuels, comments, and mentions.
- Dedicated user activity audit screen with full control to inspect and delete past actions.

### 7. 🔐 Authentication (`/login`)
- Powered by Supabase Auth:
  - 6-digit Email One-Time Passcode (OTP)
  - Google & LinkedIn OAuth
  - Traditional Password Sign-In & Sign-Up
  - Guest / Skip Sign-In testing mode

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 18)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Auth & Real-Time:** [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Backend API:** [FastAPI](https://fastapi.tiangolo.com/) (Python) + PostgreSQL

---

## 📂 Project Structure

```text
growingMoon/
├── app/                  # Next.js App Router (Pages, layouts & route handlers)
│   ├── activity/         # User activity audit view
│   ├── auth/callback/    # OAuth callback handler
│   ├── discover/         # Discover route
│   ├── explore/          # Public Explore feed
│   ├── home/             # Main community feed & sidebars
│   ├── login/            # Authentication (OTP, OAuth, Password)
│   ├── messages/         # Real-time direct messaging
│   ├── notifications/    # Notifications center
│   ├── passport/         # Journey Passport timeline & QR
│   ├── profile/          # Founder public profile & edit details
│   └── updates/          # Milestone views & creation
├── components/           # Reusable UI component modules
│   ├── explore/          # Masonry grid & editorial cards
│   ├── feed/             # Feed cards, modals & composer
│   ├── messaging/        # Chat windows & thread lists
│   ├── passport/         # Passport timeline & verification items
│   ├── profile/          # Profile widgets, radar & activity modal
│   └── shared/           # Navigation, AppShell & headers
├── lib/                  # Business logic & integrations
│   ├── api/              # Typed API clients for FastAPI backend
│   ├── state/            # React AppContext global state provider
│   └── supabaseClient.ts # Supabase Auth & Realtime client
├── types/                # Domain TypeScript definitions
└── public/               # Static assets & illustrations
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js:** v18.17+ or v20+
- **npm** or **pnpm**
- Running instance of the **growingMoonBackend** (FastAPI) on `http://localhost:8000`
- Active **Supabase** project

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/growingMoon.git
   cd growingMoon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Production Build

To test the production build locally:

```bash
npm run build
npm run start
```

---

## 📄 License

This project is proprietary and confidential. All rights reserved.
