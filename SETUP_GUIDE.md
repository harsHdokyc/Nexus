# Nexus Setup Guide

This guide will walk you through setting up all the required environment variables for Nexus.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment File Setup](#environment-file-setup)
3. [OAuth Provider Setup](#oauth-provider-setup)
   - [Google (Gmail & Meet)](#google-gmail--meet)
   - [Slack](#slack)
   - [Twitter/X](#twitterx)
   - [Microsoft Teams](#microsoft-teams)
4. [Optional Services](#optional-services)
5. [Verifying Your Setup](#verifying-your-setup)

---

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- Developer accounts for platforms you want to integrate

---

## Environment File Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and fill in the values as you complete each section below.

3. **Important**: Never commit your `.env` file to version control!


## OAuth Provider Setup

### Google (Gmail & Meet)

Google OAuth allows users to connect their Gmail and Google Meet.

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown → "New Project"
3. Name it "Nexus" and create

#### Step 2: Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable:
   - Gmail API
   - Google Calendar API (for Meet)
   - People API

#### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose "External" user type
3. Fill in the required fields:
   - App name: Nexus
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

#### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "Nexus Web Client"
5. Add Authorized redirect URIs:
   - `http://localhost:5173/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Click "Create"
7. Copy values to `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/callback/google
```

---

### Slack

#### Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name: "Nexus"
4. Select a workspace to develop in

#### Step 2: Configure OAuth & Permissions

1. Go to **OAuth & Permissions** in the sidebar
2. Add Redirect URLs:
   - `http://localhost:5173/api/auth/callback/slack`
   - `https://yourdomain.com/api/auth/callback/slack`
3. Under **User Token Scopes**, add:
   - `channels:read`
   - `channels:history`
   - `im:read`
   - `im:history`
   - `mpim:read`
   - `mpim:history`
   - `users:read`
   - `chat:write`

#### Step 3: Get Credentials

1. Go to **Basic Information**
2. Under **App Credentials**, copy:

```env
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret
SLACK_REDIRECT_URI=http://localhost:5173/api/auth/callback/slack
```

---

### Twitter/X

#### Step 1: Apply for Developer Access

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Sign up for a developer account
3. Apply for Elevated access (may take 1-2 days)

#### Step 2: Create a Project & App

1. Go to [Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new Project
3. Create an App within the project

#### Step 3: Configure OAuth 2.0

1. Go to your App settings
2. Under **User authentication settings**, click "Set up"
3. Enable OAuth 2.0
4. App permissions: Read and write
5. Type of App: Web App
6. Add Callback URLs:
   - `http://localhost:5173/api/auth/callback/twitter`
   - `https://yourdomain.com/api/auth/callback/twitter`
7. Website URL: Your app URL

#### Step 4: Get Credentials

1. Go to **Keys and tokens**
2. Under OAuth 2.0, copy:

```env
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_REDIRECT_URI=http://localhost:5173/api/auth/callback/twitter
```

---

### Microsoft Teams

#### Step 1: Register an Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click "New registration"
4. Name: "Nexus"
5. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
6. Redirect URI: Web - `http://localhost:5173/api/auth/callback/microsoft`

#### Step 2: Configure API Permissions

1. Go to **API permissions**
2. Add permissions → Microsoft Graph:
   - `User.Read`
   - `Chat.Read`
   - `Chat.ReadWrite`
   - `ChannelMessage.Read.All`
   - `Team.ReadBasic.All`
   - `offline_access`

#### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click "New client secret"
3. Add a description and expiry
4. Copy the secret value immediately (you can't see it again!)

#### Step 4: Get Credentials

1. Go to **Overview**
2. Copy:

```env
MICROSOFT_CLIENT_ID=your_application_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret_value
MICROSOFT_REDIRECT_URI=http://localhost:5173/api/auth/callback/microsoft
```

---

## Optional Services

### Upstash Redis (Caching)

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a new Redis database
3. Copy the REST URL and Token:

```env
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token
```

### Sentry (Error Monitoring)

1. Go to [sentry.io](https://sentry.io)
2. Create a new project (React)
3. Copy the DSN:

```env
SENTRY_DSN=your_sentry_dsn
```

### Encryption Key

Generate a secure encryption key for storing OAuth tokens:

```bash
openssl rand -base64 32
```

Add to `.env`:

```env
ENCRYPTION_KEY=your_generated_key
```

---

## Verifying Your Setup

After configuring all environment variables:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Check the console for any configuration errors

3. Try connecting each platform:
   - Go to Settings → Account → Connected Platforms
   - Click "Connect" on each platform
   - Complete the OAuth flow

4. If you encounter errors, check:
   - Redirect URIs match exactly (including trailing slashes)
   - All required scopes are enabled
   - API keys are correct and not expired

---

## Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Ensure the redirect URI in your `.env` exactly matches what's configured in the OAuth provider
- Check for trailing slashes

**"Access denied" or "Invalid scope"**
- Verify all required scopes are added to your OAuth app
- For Google, ensure APIs are enabled

**"Client ID not found"**
- Double-check you copied the correct credentials
- Ensure there are no extra spaces

### Getting Help

- Check our [documentation](https://docs.nexus.app)
- Join our [Discord community](https://discord.gg/nexus)
- Email support: support@nexus.app

---

## Next Steps

Once your environment is configured:

1. Set up Edge Functions for OAuth callbacks
2. Configure webhooks for real-time updates
3. Deploy to production

Happy building! 🚀
