<div align="center">
  <img src="./public/logoWithName.png" alt="Links Overflow Logo" width="300"/>
  
  <h1>Links Overflow</h1>
  <p>A smart, AI-powered bookmark manager to organize, categorize, and save links from across the web.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

  <p>Live demo - <a href="https://links-overflow.vercel.app">Links Overflow</a></p>
</div>

## 📖 Overview

**Links Overflow** is a modern web application designed to help you organize the chaos of your saved links. Instead of manually sorting your bookmarks, Links Overflow uses **Google Generative AI (Gemini)** to automatically analyze and categorize any URL you paste — whether it's a YouTube video, a GitHub repository, a LeetCode problem, a Figma design, or a simple blog post.

## ✨ Features

- **🤖 AI-Powered Categorization**: Simply paste a URL, and the app automatically fetches the metadata (using Cheerio) and categorizes it using Google Generative AI.
- **🔍 Intelligent Search**: Fast, fuzzy searching across your links' titles, descriptions, categories, and custom metadata (powered by Fuse.js).
- **📂 Smart Organization**: Links are automatically grouped into predefined categories (YouTube, GitHub, LinkedIn, Design, Coding Platforms, etc.), with support for custom sections.
- **📱 Responsive UI/UX**: A beautiful, modern, dark-themed interface built with Tailwind CSS, featuring smooth micro-animations and a responsive sidebar for mobile devices.
- **🔔 Real-time Feedback**: Toast notifications to keep you informed about successful categorization, duplicates, or errors.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Integration**: `@google/generative-ai` (Gemini API)
- **Web Scraping**: `cheerio` (for metadata extraction)
- **Search**: `fuse.js` (for fuzzy search)
- **Icons**: `lucide-react`

## 📁 Folder Structure

```text
links-overflow/
├── public/                 # Static assets (logos, favicons, etc.)
├── src/
│   ├── app/                # Next.js App Router (Pages & API)
│   │   ├── api/            # API Routes (e.g., fetch-link with AI logic)
│   │   ├── globals.css     # Global Tailwind CSS styles
│   │   ├── layout.tsx      # Root application layout
│   │   └── page.tsx        # Main Dashboard Page
│   ├── components/         # Reusable React components
│   │   ├── hero-footer.tsx # Footer component
│   │   ├── link-card.tsx   # Card component to display individual links
│   │   └── sidebar.tsx     # Navigation sidebar for filtering categories
│   ├── hooks/              # Custom React Hooks
│   │   └── useAuthSession.ts # State & session management
│   └── lib/                # Utility functions and types
│       └── types.ts        # TypeScript interfaces & types
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### 1. Clone the repository

```bash
git clone https://github.com/yashthakur-01/links-overflow.git
cd links-overflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env.local` file in the root directory and add your Google Gemini API key:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

## 📦 Build Commands

- `npm run dev`: Starts the development server.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the application in production mode.
- `npm run lint`: Runs ESLint to catch errors and enforce code style.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yashthakur-01/links-overflow/issues) if you want to contribute.
