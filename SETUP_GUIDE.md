# AdVantage Setup Guide

This guide will help you set up and run the AdVantage project locally.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier)
- Google Cloud account (for Gemini API)

## Step 1: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API in your Supabase dashboard
3. Copy your Project URL and Anon Public Key

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google APIs
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
```

## Step 4: Run Database Migrations

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Run migrations:
```bash
supabase db push
```

Or manually run the SQL in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor.

## Step 5: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## Step 6: Start the Development Server

```bash
npm start
# or
yarn start
```

This will start the Expo development server. You can:
- Press `a` to open on Android
- Press `i` to open on iOS Simulator
- Scan QR code with Expo Go app on your phone

## Troubleshooting

### TypeScript Errors
If you see TypeScript errors, try:
```bash
npm run type-check
```

### Metro Bundler Issues
Clear cache:
```bash
expo start --clear
```

### Supabase Connection Issues
- Verify your Supabase URL and Anon Key are correct
- Check if your Supabase project is active
- Ensure RLS policies are configured correctly

## Next Steps

1. **Test Authentication**: Try signing up and logging in
2. **Create Test Data**: Add some test companies and programs
3. **Configure AI**: Test the Gemini API integration
4. **Deploy**: Follow the deployment guide for Coolify setup

## Useful Commands

```bash
# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Build for production
expo build:android
expo build:ios
```

## Support

For issues or questions:
- Check the [README.md](README.md)
- Review the [PRD](AdVantage_PRD.md)
- Check Expo and Supabase documentation 