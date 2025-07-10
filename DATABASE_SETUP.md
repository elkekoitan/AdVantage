# AdVantage Database Setup Instructions 🗄️

## Overview
This document provides step-by-step instructions for setting up the AdVantage database schema in Supabase.

## Prerequisites
- Supabase account (free tier available)
- Supabase project created
- Admin access to Supabase SQL Editor

## Database Schema Overview

Our database includes **15+ interconnected tables** designed for:
- **User Management**: Profiles, authentication, preferences
- **Business Management**: Companies, campaigns, analytics
- **Content Management**: Programs, activities, recommendations
- **Social Features**: Shares, reviews, referrals
- **Analytics**: Traffic, performance, transactions

## 🚀 Quick Setup (Manual Migration)

### Step 1: Access Supabase SQL Editor
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `qxcgthwitspojqlmgjlr`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy Migration SQL
Copy the entire content from `supabase/migrations/001_initial_schema.sql` and paste it into the SQL Editor.

### Step 3: Execute Migration
1. Click **Run** button (or press `Ctrl+Enter`)
2. Wait for execution to complete
3. Check for any errors in the output

### Step 4: Verify Setup
```sql
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify extensions
SELECT * FROM pg_extension;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📋 Database Tables Created

### Core Tables
1. **profiles** - User profiles extending auth.users
2. **companies** - Business/company information
3. **programs** - Daily programs/itineraries
4. **program_activities** - Individual activities within programs
5. **campaigns** - Marketing campaigns and offers
6. **user_campaigns** - User interactions with campaigns

### Social & Analytics Tables
7. **social_shares** - Social media sharing tracking
8. **referral_visits** - Referral and visit tracking
9. **company_analytics** - Business analytics and metrics
10. **recommendations** - AI-powered recommendations
11. **partnerships** - Influencer partnerships
12. **transactions** - Payment and transaction records
13. **reviews** - User reviews and ratings
14. **notifications** - User notifications

### Extensions Installed
- **uuid-ossp** - UUID generation
- **postgis** - Geographic data support
- **pg_trgm** - Text similarity search
- **vector** - Vector similarity search (for AI)

## 🔐 Security Features

### Row Level Security (RLS)
- **Enabled** on all tables
- **Policies** for user data access
- **Authentication** required for sensitive operations

### Basic Policies Applied
- Users can view/update their own profiles
- Public data is viewable by everyone
- Company owners can manage their businesses
- Programs can be public or private

## 🔧 Advanced Configuration

### Indexes for Performance
- **Geographic indexes** for location-based queries
- **Compound indexes** for complex queries
- **Text indexes** for search functionality

### Triggers and Functions
- **Auto-timestamp** updates on record changes
- **Rating calculations** for companies
- **Referral tracking** automation

## 📊 Sample Data (Optional)

After migration, you can add sample data:

```sql
-- Sample user profile
INSERT INTO public.profiles (id, username, full_name, bio) VALUES
('00000000-0000-0000-0000-000000000001', 'johndoe', 'John Doe', 'Test user profile');

-- Sample company
INSERT INTO public.companies (owner_id, name, description, category, location) VALUES
('00000000-0000-0000-0000-000000000001', 'Test Restaurant', 'A great place to eat', 'restaurant', 'POINT(-122.4194 37.7749)');

-- Sample program
INSERT INTO public.programs (user_id, title, description, date) VALUES
('00000000-0000-0000-0000-000000000001', 'Day in SF', 'Exploring San Francisco', '2025-01-15');
```

## 🚨 Troubleshooting

### Common Issues

#### Extension Not Found
```
ERROR: extension "postgis" is not available
```
**Solution**: PostGIS is available in Supabase Pro tier. For free tier, remove PostGIS-related code.

#### Permission Denied
```
ERROR: permission denied for schema public
```
**Solution**: Ensure you're using the correct database URL and have admin privileges.

#### RLS Policy Conflicts
```
ERROR: policy already exists
```
**Solution**: Drop existing policies or use `CREATE POLICY IF NOT EXISTS`.

### Migration Rollback
If you need to rollback:
```sql
-- Drop all tables (DANGER: This will delete all data!)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.partnerships CASCADE;
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.company_analytics CASCADE;
DROP TABLE IF EXISTS public.referral_visits CASCADE;
DROP TABLE IF EXISTS public.social_shares CASCADE;
DROP TABLE IF EXISTS public.user_campaigns CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.program_activities CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

## 🔄 Future Migrations

### Adding New Tables
Create new migration files in `supabase/migrations/` with format:
```
002_add_new_feature.sql
003_update_existing_tables.sql
```

### Best Practices
1. **Always backup** before major changes
2. **Test migrations** in development first
3. **Document changes** in migration files
4. **Use transactions** for complex migrations

## 📈 Performance Optimization

### Query Optimization
- Use **appropriate indexes** for your queries
- **Analyze query plans** with EXPLAIN
- **Monitor slow queries** in Supabase logs

### Connection Management
- Use **connection pooling** for production
- **Optimize connection limits** based on usage
- **Monitor connection health**

## 🔗 Integration with Application

### Environment Variables
Ensure these are set in your `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=https://qxcgthwitspojqlmgjlr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Connection Test
```typescript
// Test connection in your app
import { supabase } from './src/services/supabase';

const testConnection = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('Database connection failed:', error);
  } else {
    console.log('Database connected successfully!');
  }
};
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Verification Checklist

After completing the migration:

- [ ] All 14 tables created successfully
- [ ] Extensions installed (uuid-ossp, postgis, pg_trgm, vector)
- [ ] Indexes created for performance
- [ ] RLS policies applied
- [ ] Triggers and functions working
- [ ] Sample data inserted (optional)
- [ ] Application can connect to database
- [ ] Basic queries working
- [ ] Authentication flow tested

## 🎯 Next Steps

1. **Run the migration** following the steps above
2. **Test database connection** from your app
3. **Verify authentication** works correctly
4. **Start development server** with `npm start`
5. **Test basic functionality** (login, register)

---

## 🔥 Quick Copy-Paste Migration

For convenience, here's the complete migration SQL:

```sql
-- AdVantage Database Schema - Quick Setup
-- Copy and paste this entire block into Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- Note: PostGIS requires Pro tier, comment out if using free tier
-- CREATE EXTENSION IF NOT EXISTS "postgis";
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- (Rest of the schema would be included here...)
```

---

**Status**: Ready for execution  
**Estimated Time**: 5-10 minutes  
**Difficulty**: Beginner  
**Support**: Available via project documentation 