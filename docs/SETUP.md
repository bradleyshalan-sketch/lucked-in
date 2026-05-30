# Lucked-In Backend Setup Guide

## Prerequisites

- Node.js v16+
- npm or yarn
- Supabase account (free tier available at supabase.com)

## Step 1: Clone Repository

```bash
git clone https://github.com/bradleyshalan-sketch/lucked-in.git
cd lucked-in
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your credentials from Settings > API:
   - `SUPABASE_URL` - Your project URL
   - `SUPABASE_KEY` - Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key

### Run Migrations

1. Go to Supabase Dashboard > SQL Editor
2. Click "New Query"
3. Copy all the SQL from `migrations/001_init_schema.sql`
4. Paste and click "Run"

This will create all the tables, indexes, and RLS policies.

## Step 4: Setup Environment Variables

```bash
cp .env.example .env
```

Fill in the `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development

# Supabase (from Step 3)
SUPABASE_URL=your_url_here
SUPABASE_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT (generate a random string)
JWT_SECRET=your_super_secret_key_at_least_32_chars_long
JWT_EXPIRE=7d
```

For now, leave the OAuth and Stripe keys empty. We'll add them in Day 2.

## Step 5: Create Logs Directory

```bash
mkdir -p logs
```

## Step 6: Start Development Server

```bash
npm run dev
```

You should see:

```
🚀 Server is running on http://localhost:3000
```

## Step 7: Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "user-uuid-here",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "tier": "FREE"
    },
    "token": "jwt-token-here"
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Get Current User

Use the token from signup/login:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### "Missing Supabase credentials"

- Make sure `.env` file exists
- Check that `SUPABASE_URL` and `SUPABASE_KEY` are set
- Verify they're not empty strings

### "Connection refused"

- Make sure port 3000 is not in use
- Try `npm run dev` again

### Database errors

- Verify migrations were run successfully in Supabase
- Check Supabase dashboard for any error messages
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is correct

## Next Steps

- Day 2: OAuth setup for YouTube, Instagram, TikTok, Facebook
- Day 3: Dashboard APIs for stats
- Day 4: Post scheduling

---

**Questions?** Check the logs in `logs/` directory for debugging info.
