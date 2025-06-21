# Loft AI - AI-Enhanced Bookmarking Platform

<div align="center">
  <img src="/public/logo.svg" alt="Loft AI Logo" width="120" height="120" />
  <h1>Save everything. Remember anything.</h1>
  <p>Loft uses AI to automatically summarize, tag, and resurface your saved links, social posts, and ideas exactly when you need them most.</p>
</div>

## 🚀 Overview

Loft AI is a modern, AI-powered bookmarking platform that helps users save, organize, and rediscover content from across the web. Built with Next.js 15, TypeScript, and cutting-edge AI technologies, it provides intelligent content summarization, automatic tagging, and smart content resurfacing.

### Key Features

- 🤖 **AI-Powered Summaries**: Automatic content summarization using Perplexity AI
- 🏷️ **Smart Tagging**: AI-generated tags for better content organization
- 🔍 **Natural Language Search**: Ask questions in plain English to find your saved content
- 📱 **Multi-Platform Support**: Save from Instagram, YouTube, Twitter, and web browsers
- 🎯 **Daily Cards**: Intelligent content resurfacing based on your interests
- 🔐 **Secure Authentication**: Built-in user authentication with Clerk
- 📊 **Analytics Integration**: User behavior tracking with Amplitude
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS and Radix UI

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Tailwind CSS Animate
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Markdown**: React Markdown

### Backend & AI
- **AI Models**: 
  - Perplexity AI (Sonar model)
  - OpenAI GPT models
  - Google AI SDK
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Clerk
- **Analytics**: Amplitude
- **Metadata Scraping**: Metascraper + Open Graph Scraper

### Development Tools
- **Package Manager**: pnpm
- **Linting**: Next.js ESLint
- **Type Checking**: TypeScript
- **PostCSS**: Autoprefixer

## 📁 Project Structure

```
loft-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── bookmarks/     # Bookmark management
│   │   ├── collections/   # Collection management
│   │   ├── library/       # Library features
│   │   ├── metadata/      # Content metadata
│   │   ├── notes/         # Notes functionality
│   │   ├── run-through/   # Content review
│   │   ├── statistics/    # Analytics
│   │   └── tags/          # Tag management
│   ├── bookmarks/         # Bookmarks page
│   ├── library/           # Library page
│   ├── profile/           # User profile
│   ├── run-through/       # Content review page
│   ├── save/              # Save content page
│   └── signin-signup/     # Authentication pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── save-modal.tsx    # Save content modal
│   └── theme-provider.tsx # Theme management
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
├── styles/               # Global styles
└── middleware.ts         # Next.js middleware
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)
- Clerk account for authentication
- Perplexity AI API key
- OpenAI API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loft-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL=your_neon_postgresql_url
   
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # AI Services
   PERPLEXITY_API_KEY=your_perplexity_api_key
   OPENAI_API_KEY=your_openai_api_key
   
   # Analytics
   NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_api_key
   AMPLITUDE_SECRET_KEY=your_amplitude_secret_key
   ```

4. **Set up the database**
   The application will automatically create necessary tables on first run, but you can also run the SQL commands manually:
   ```sql
   -- Bookmarks table
   CREATE TABLE IF NOT EXISTS bookmarks (
     id SERIAL PRIMARY KEY,
     url TEXT NOT NULL,
     title TEXT,
     summary TEXT,
     clerk_username TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Search table
   CREATE TABLE IF NOT EXISTS search (
     id SERIAL PRIMARY KEY,
     query TEXT NOT NULL,
     clerk_username TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Endpoints

### Bookmarks
- `POST /api/bookmarks` - Save a new bookmark with AI processing
- `GET /api/bookmarks?type=saved-searches` - Get user's saved searches
- `GET /api/bookmarks/[id]` - Get specific bookmark
- `POST /api/bookmarks/summary` - Generate AI summary for URL

### Collections
- `GET /api/collections` - Get user collections
- `POST /api/collections` - Create new collection

### Library
- `GET /api/library` - Get user's library content

### Tags
- `GET /api/tags` - Get available tags
- `POST /api/tags` - Create new tag

### Statistics
- `GET /api/statistics` - Get user analytics

## 🎨 UI Components

The project uses a comprehensive set of UI components built with Radix UI and styled with Tailwind CSS:

- **Layout Components**: Cards, Containers, Grids
- **Form Components**: Inputs, Buttons, Selects, Checkboxes
- **Navigation**: Menus, Tabs, Breadcrumbs
- **Feedback**: Toasts, Alerts, Progress bars
- **Data Display**: Tables, Lists, Badges
- **Overlays**: Modals, Popovers, Tooltips

## 🤖 AI Integration

### Content Processing
- **Automatic Summarization**: Uses Perplexity AI to generate concise summaries
- **Smart Tagging**: AI-generated tags for better content organization
- **Title Enhancement**: Improves and enhances content titles
- **Social Media Processing**: Special handling for X (Twitter), Instagram, and YouTube content

### Search & Discovery
- **Natural Language Search**: Query your saved content using plain English
- **Semantic Search**: AI-powered content discovery
- **Smart Recommendations**: Content suggestions based on user behavior

## 🔐 Authentication & Security

- **Clerk Integration**: Secure user authentication and management
- **Protected Routes**: Middleware-based route protection
- **User Sessions**: Persistent user sessions with secure token handling
- **Role-based Access**: User-specific data isolation

## 📊 Analytics & Monitoring

- **Amplitude Integration**: User behavior tracking and analytics
- **Performance Monitoring**: Built-in Next.js performance monitoring
- **Error Tracking**: Comprehensive error handling and logging

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🧪 Development

### Available Scripts
```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open database studio
```

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure responsive design for all new components
- Follow the existing code style and patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for the deployment platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Clerk** for authentication services
- **Perplexity AI** for AI capabilities
- **Neon** for serverless PostgreSQL

## 📞 Support

For support, email support@loftai.com or join our Discord community.

---

<div align="center">
  <p>Built with ❤️ by the Loft AI team</p>
  <p>
    <a href="https://twitter.com/loftai">Twitter</a> •
    <a href="https://discord.gg/loftai">Discord</a> •
    <a href="https://loftai.com">Website</a>
  </p>
</div> 