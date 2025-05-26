# ShopTrack - Small Business Income/Expense Tracker

ShopTrack is a lightweight web application designed to help small business owners easily track their income and expenses in real-time, with voice and photo input capabilities.

## Features

- 📱 Mobile-first responsive design
- 🎤 Voice input for quick transaction logging
- 📸 Photo receipt capture
- 📊 Real-time profit/loss dashboard
- 🔄 Offline support with local storage + Supabase sync
- 📈 Visual financial charts
- 🌓 Dark/light mode

## Technologies Used

- Next.js 14
- Supabase (Authentication + Database)
- Web Speech API (Voice input)
- Tailwind CSS
- Local Storage (Offline support)
- PWA Capabilities

## Prompt Used with Lovable.ai

```markdown
Create a fullstack web application called "ShopTrack" for small business owners to track income and expenses in real-time using Next.js, Supabase, and local storage as a fallback. The app should have:

1. Core Features:
   - Voice input for quick transaction logging (using Web Speech API)
   - Photo receipt capture (using device camera)
   - Simple income/expense categorization
   - Real-time profit/loss dashboard
   - Local storage synchronization with Supabase backend

2. UI Requirements:
   - Mobile-first responsive design
   - Clean, intuitive interface with minimal form fields
   - Visual charts for financial overview
   - Dark/light mode toggle

3. Technical Specifications:
   - Next.js 14 frontend
   - Supabase for:
     - User authentication
     - Data persistence
     - Real-time updates
   - Local storage fallback for offline functionality
   - Service worker for PWA capabilities
   - Zod for form validation
   - Tailwind CSS for styling

4. AI Integration Points:
   - Voice-to-text transaction logging
   - Receipt image text extraction
   - Smart transaction categorization

5. Data Structure:
   - Users table (id, email, name)
   - Transactions table (id, user_id, amount, type, category, date, notes)
   - Categories table (id, name, color)

6. Special Considerations:
   - Offline-first approach
   - Data sync when connection restored
   - Simple onboarding flow
   - Export to CSV functionality
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase environment variables
4. Run the development server: `npm run dev`

## How It Addresses the Hackathon Problem

ShopTrack solves the challenge of small traders who don't track their income or expenses by providing:
- Simple, intuitive tracking tools
- Multiple input methods (voice/photo/manual)
- Instant financial insights
- Offline functionality for areas with poor connectivity
