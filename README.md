# FocusDock

**A beautiful developer dashboard that visualizes your GitHub commits, work hours, and Spotify listening habits.**

## ✨ Features

### Core Features
- 🎨 **Glassmorphism UI** - Beautiful frosted glass design with dark theme
- 🌍 **Multi-language** - Full support for English and Japanese (i18n)
- 📊 **30-Day Grass Graphs** - Visual representation of your development journey
- ⏱️ **Focus Timer** - Track your work sessions with automatic inactivity detection
- 🔐 **Secure Authentication** - Powered by Supabase Auth

### GitHub Integration
- Track commits across repositories
- Filter by squash/merge/bot commits
- Customizable commit counting rules
- Visual overflow indicators (10+ commits sparkle)

### Work Hour Tracking
- Focus mode with activity detection
- Automatic pause after 5 minutes of inactivity
- Daily and historical statistics
- 1 block = 1 hour visualization

### Spotify Integration (Premium Feature)
- Track listening during focus sessions
- Top artists ranking (last 30 days)
- Beautiful artist cards with play time
- Premium-only feature with elegant paywall

### Pricing & Payments
- **Monthly Plan**: $2.99/month
- **Lifetime Plan**: $14.99 (one-time)
- **Custom Donations**: Support the project with any amount
- Stripe Elements integration (no Checkout redirect)
- Webhook-based subscription management

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **next-intl** - Internationalization

### Backend & Services
- **Supabase** - Authentication, Database, RLS
- **Stripe** - Payment processing
- **GitHub API** - Commit tracking
- **Spotify API** - Music integration

### Design System
- Glassmorphism with backdrop-blur
- Custom Tailwind theme
- Purple/Pink gradient accents
- Responsive grid layouts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account
- GitHub OAuth App
- Spotify OAuth App (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/focusdock.git
cd focusdock
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Spotify OAuth (optional)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up Supabase:
```bash
# Run the schema.sql file in your Supabase SQL editor
# File location: supabase/schema.sql
```

6. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
FocusDock/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── create-payment-intent/
│   │   └── webhooks/stripe/
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── dashboard/            # Main dashboard
│   ├── integrations/         # OAuth integrations
│   │   ├── github/
│   │   └── spotify/
│   ├── pricing/              # Pricing & payments
│   ├── settings/             # User settings
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/               # React components
│   ├── grass-graph.tsx       # Grass visualization
│   ├── focus-timer.tsx       # Focus mode timer
│   ├── spotify-artists.tsx   # Artist rankings
│   └── payment-form.tsx      # Stripe payment
├── lib/                      # Utilities & config
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # Server client
│   ├── store/                # Zustand stores
│   │   ├── use-settings-store.ts
│   │   └── use-focus-store.ts
│   └── types/
│       └── database.types.ts
├── i18n/                     # Internationalization
│   ├── messages/
│   │   ├── en.json
│   │   └── ja.json
│   ├── routing.ts
│   └── request.ts
├── supabase/
│   └── schema.sql            # Database schema
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- Secure API key management
- HTTPS-only cookies
- Stripe webhook signature verification
- OAuth state validation
- No sensitive data in client bundle

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables in Production
Make sure to set all variables from `.env.example` in your deployment platform.

### Stripe Webhooks
Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

Events to listen for:
- `payment_intent.succeeded`
- `customer.subscription.deleted`

## 📊 Database Schema

### Tables
- **user_profiles** - User data and subscription status
- **github_commits** - Commit history with metadata
- **work_sessions** - Focus session records
- **spotify_sessions** - Listening history (premium only)

See `supabase/schema.sql` for full schema.

## 🎨 Customization

### Grass Graph Colors
Users can customize colors for:
- GitHub commits (default: purple)
- Work hours (default: pink)
- Spotify (default: green)

### Display Options
- Toggle individual grass graphs on/off
- Configure GitHub commit filtering
- Language preference (EN/JA)

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

## 💬 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ by developers, for developers.
# FocusDock
