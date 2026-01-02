# Setup Guide

This guide will walk you through setting up FocusDock for production deployment.

## 1. Supabase Setup

### Create a Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and keys

### Run Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `supabase/schema.sql`
3. Run the SQL script
4. Verify tables are created under Database > Tables

### Configure Authentication
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Enable GitHub OAuth:
   - Add GitHub as a provider
   - Enter your GitHub OAuth app credentials
   - Add callback URL: `https://yourdomain.com/auth/callback`

## 2. GitHub OAuth App

### Create OAuth App
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - Application name: FocusDock
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/integrations/github/callback`
4. Save Client ID and Client Secret

### Permissions
The app requests:
- `read:user` - Read user profile
- `repo` - Access repositories for commit data

## 3. Spotify OAuth App

### Create App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add Redirect URI: `https://yourdomain.com/integrations/spotify/callback`
4. Note Client ID and Client Secret

### Required Scopes
- `user-read-recently-played`
- `user-top-read`

## 4. Stripe Setup

### Create Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete business verification
3. Get API keys from Dashboard

### Create Products
1. Go to Products
2. Create two products:
   - **Monthly Subscription** - $2.99/month recurring
   - **Lifetime Access** - $14.99 one-time

### Configure Webhooks
1. Go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `customer.subscription.deleted`
4. Note the webhook signing secret

## 5. Environment Variables

Create `.env` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# GitHub
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Spotify
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 6. Vercel Deployment

### Initial Deploy
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables from above
4. Deploy

### Post-Deploy
1. Copy deployment URL
2. Update OAuth callback URLs in GitHub and Spotify
3. Update Stripe webhook endpoint
4. Test all integrations

## 7. Testing Checklist

### Authentication
- [ ] Email signup works
- [ ] Email login works
- [ ] GitHub OAuth works
- [ ] Logout works
- [ ] Protected routes redirect correctly

### Integrations
- [ ] GitHub connection works
- [ ] Commits are fetched and displayed
- [ ] Spotify connection requires paid plan
- [ ] Spotify data shows for paid users

### Payments
- [ ] Monthly plan can be purchased
- [ ] Lifetime plan can be purchased
- [ ] Donation flow works
- [ ] Webhook updates subscription status
- [ ] Spotify unlocks after payment

### Features
- [ ] Focus timer starts/stops
- [ ] Grass graphs display correctly
- [ ] Settings persist
- [ ] Language switching works
- [ ] Color customization works

## 8. Production Optimizations

### Performance
- Images are optimized via Next.js Image
- Turbopack enabled for faster builds
- React 19 concurrent features

### Security
- RLS policies on all tables
- API keys in environment only
- HTTPS enforced
- Webhook signatures verified

### Monitoring
- Set up Vercel Analytics
- Enable Supabase logging
- Monitor Stripe dashboard

## 9. Troubleshooting

### "Unauthorized" errors
- Check Supabase RLS policies
- Verify JWT token is valid
- Ensure user is authenticated

### OAuth callback fails
- Verify callback URLs match exactly
- Check environment variables
- Ensure OAuth apps are active

### Stripe webhook not working
- Verify webhook endpoint is public
- Check webhook secret matches
- Review Stripe webhook logs

### Grass graphs not showing
- Verify data exists in database
- Check date range (last 30 days)
- Ensure filters are not excluding all data

## Need Help?

Open an issue on GitHub with:
- Description of the problem
- Steps to reproduce
- Error messages
- Environment (dev/production)
