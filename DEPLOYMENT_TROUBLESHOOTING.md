# Cloudflare Pages Deployment Troubleshooting

## Current Status

✅ **Build**: Success
❌ **Runtime**: HTTP 522 Error (Connection Timed Out)

## Problem Analysis

The deployment builds successfully but returns HTTP 522 when accessed. This indicates the application is crashing during runtime initialization.

### Most Likely Cause: Missing Environment Variables

The middleware (`src/middleware.ts`) calls Supabase's `updateSession()` on every request. If Supabase environment variables are not configured, the application will crash during middleware initialization.

## Required Environment Variables

### Critical (Application will crash without these)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Application URL
NEXT_PUBLIC_APP_URL=https://vibetrans.pages.dev
```

### Important for Full Functionality

```bash
# Authentication
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Database (if using Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Stripe (for payment features)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...
```

## How to Configure Environment Variables in Cloudflare Pages

### Method 1: Via Dashboard (Recommended)

1. Visit https://dash.cloudflare.com/
2. Go to **Workers & Pages** > **vibetrans**
3. Click **Settings** tab
4. Scroll to **Environment variables**
5. Add each variable:
   - Click **Add variable**
   - Enter **Variable name**
   - Enter **Value**
   - Select **Production** environment
   - Click **Save**

6. **Important**: After adding all variables, trigger a new deployment:
   - Go to **Deployments** tab
   - Click **Retry deployment** on the latest build
   - Or push a new commit to trigger rebuild

### Method 2: Via Wrangler CLI

```bash
# Set a single variable
pnpm wrangler pages project variable set NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" --project-name=vibetrans

# Set multiple variables from file
# Create .env.production first, then:
while IFS='=' read -r key value; do
  [ -z "$key" ] || [ "${key:0:1}" = "#" ] && continue
  pnpm wrangler pages project variable set "$key"="$value" --project-name=vibetrans
done < .env.production
```

## Get Supabase Credentials

### 1. Visit Supabase Dashboard

Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api

### 2. Copy These Values

- **Project URL**: Under "Configuration" > "URL"
- **Anon/Public Key**: Under "Project API keys" > "anon public"

### 3. Database Connection String (Optional)

Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/database

Click **Connection string** > **URI** and copy the pooled connection string.

## Verification Steps

### 1. Check Environment Variables

```bash
pnpm wrangler pages project variable list --project-name=vibetrans
```

### 2. Trigger Redeploy

After adding environment variables:

```bash
# Option A: Via dashboard
# Go to Deployments > Retry deployment

# Option B: Push a dummy commit
git commit --allow-empty -m "chore: trigger redeploy"
git push origin cloudflare
```

### 3. Wait for Build

Monitor at: https://dash.cloudflare.com/pages/view/vibetrans

### 4. Test Deployment

```bash
curl -I https://vibetrans.pages.dev
# Should return: HTTP/2 200 (not 522)
```

## Additional Supabase Configuration

### Configure Allowed Redirect URLs

1. Visit: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/url-configuration

2. Add these URLs:
   - **Site URL**: `https://vibetrans.pages.dev`
   - **Redirect URLs**:
     - `https://vibetrans.pages.dev/auth/callback`
     - `https://vibetrans.pages.dev/auth/login`
     - `https://vibetrans.pages.dev/auth/register`

## Common Errors and Solutions

### HTTP 522 - Connection Timed Out

**Cause**: Application crashing during startup
**Solution**: Check environment variables are configured correctly

### HTTP 500 - Internal Server Error

**Cause**: Runtime error in application code
**Solution**: Check Cloudflare Pages logs via dashboard or wrangler

### Supabase Auth Errors

**Cause**: Invalid Supabase credentials or misconfigured redirect URLs
**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Check redirect URLs in Supabase dashboard

### Database Connection Errors

**Cause**: Invalid `DATABASE_URL` or network restrictions
**Solution**:
1. Use Supabase's **pooled connection string** (port 6543)
2. Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

## Next Steps

1. ✅ Configure all required environment variables in Cloudflare Pages
2. ✅ Add redirect URLs in Supabase dashboard
3. ✅ Trigger a new deployment
4. ✅ Test the deployed application
5. ✅ Follow the checklist in `DEPLOY_CHECKLIST.md`

## Need Help?

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: https://github.com/Jasonchen52011/vibetrans/issues

---

**Last Updated**: 2025-10-07 after successful build but runtime 522 error
