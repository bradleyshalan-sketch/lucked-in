# Lucked-In Backend

Multi-platform creator management dashboard API.

## Features

- ✅ User authentication (email/password)
- ✅ Multi-platform OAuth (YouTube, Instagram, TikTok, Facebook)
- ✅ Dashboard APIs for stats & earnings
- ✅ Post scheduling across multiple platforms
- ✅ Free tier (1 account) + Premium tier
- ✅ Subscription management via Stripe

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/bradleyshalan-sketch/lucked-in.git
cd lucked-in/backend
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your Supabase, OAuth, and Stripe credentials.

### 3. Setup Supabase

Create tables by running:

```bash
npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs on http://localhost:3000

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

### Platform OAuth
- `GET /api/auth/youtube` - Start YouTube OAuth
- `GET /api/auth/youtube/callback` - YouTube OAuth callback
- `GET /api/auth/instagram` - Start Instagram OAuth
- `GET /api/auth/instagram/callback` - Instagram OAuth callback
- `GET /api/auth/tiktok` - Start TikTok OAuth
- `GET /api/auth/tiktok/callback` - TikTok OAuth callback
- `GET /api/auth/facebook` - Start Facebook OAuth
- `GET /api/auth/facebook/callback` - Facebook OAuth callback

### User Accounts
- `GET /api/accounts` - List connected accounts
- `DELETE /api/accounts/:accountId` - Disconnect account

### Dashboard
- `GET /api/dashboard` - Get unified stats
- `GET /api/dashboard/:platform` - Get platform-specific stats

### Posts
- `POST /api/posts/schedule` - Schedule post across platforms
- `GET /api/posts` - List scheduled posts
- `DELETE /api/posts/:postId` - Cancel scheduled post

### Subscription
- `GET /api/subscription` - Get current subscription
- `POST /api/subscription/upgrade` - Upgrade to premium
- `POST /api/subscription/cancel` - Cancel premium

## Architecture

```
src/
├── config/        # Configuration files
├── middleware/    # Express middleware
├── routes/        # API route handlers
├── services/      # Business logic
├── utils/         # Helper functions
├── validators/    # Input validation
├── app.js         # Express app
└── server.js      # Entry point

migrations/       # Database migrations
scripts/          # Setup scripts
```

## Database Schema

See `migrations/001_init_schema.sql` for full schema.

Main tables:
- `users` - User accounts
- `subscriptions` - Free/Premium tiers
- `connected_accounts` - OAuth tokens for each platform
- `platform_stats` - Followers, views, earnings per platform
- `scheduled_posts` - Posts scheduled for publishing
- `audit_logs` - Security & compliance logs

## Next Steps

1. Set up Supabase project
2. Get OAuth credentials from YouTube, Instagram, TikTok, Facebook
3. Configure Stripe for payments
4. Run migrations
5. Start development server
6. Build mobile app that consumes these APIs

## Support

Built by Bradley Shalan & Co.
