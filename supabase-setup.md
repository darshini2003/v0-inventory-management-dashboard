# Supabase Integration Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a database password and region
3. Wait for the project to be created (2-3 minutes)

## 2. Get Your Project Credentials

1. Go to Settings → API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

## 3. Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## 4. Database Schema Setup

1. Go to SQL Editor in your Supabase dashboard
2. Copy and run the entire `database/schema.sql` file
3. This will create:
   - All necessary tables
   - Row Level Security (RLS) policies
   - Database functions and triggers
   - Sample data

## 5. Authentication Configuration

1. Go to Authentication → Settings in Supabase dashboard
2. Configure Site URL: `http://localhost:3000`
3. Add Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)
4. Enable email confirmations (optional)
5. Configure email templates if needed

## 6. Storage Setup (Optional)

If you plan to upload product images:

1. Go to Storage in Supabase dashboard
2. Create a bucket named `product-images`
3. Set it to public if you want direct access to images
4. Configure RLS policies for the bucket

## 7. Real-time Configuration

Real-time subscriptions are enabled by default. To configure:

1. Go to Database → Replication in Supabase dashboard
2. Enable replication for tables you want real-time updates:
   - products
   - orders
   - activities
   - profiles

## 8. Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to login page
4. Create a new account via the register page
5. Check your email for verification (if enabled)
6. Login and test all dashboard features

## 9. Production Deployment

1. Update environment variables for production
2. Configure production URLs in Supabase auth settings
3. Set up proper domain and SSL
4. Test all functionality in production environment

## 10. Security Checklist

- ✅ RLS policies are enabled on all tables
- ✅ Service role key is kept secret
- ✅ Authentication is required for all dashboard routes
- ✅ User roles are properly enforced
- ✅ Input validation is implemented
- ✅ Error handling doesn't expose sensitive data

## Troubleshooting

### Common Issues:

1. **Authentication not working**: Check environment variables and auth settings
2. **Database errors**: Verify schema was applied correctly
3. **Permission denied**: Check RLS policies and user roles
4. **Real-time not working**: Verify replication is enabled for tables
