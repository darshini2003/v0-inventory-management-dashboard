# Supabase Integration Guide for StockSync

This guide provides step-by-step instructions for setting up and integrating Supabase with the StockSync inventory management system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a Supabase Project](#creating-a-supabase-project)
3. [Database Setup](#database-setup)
4. [Authentication Configuration](#authentication-configuration)
5. [Storage Setup](#storage-setup)
6. [Environment Variables](#environment-variables)
7. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
8. [Realtime Configuration](#realtime-configuration)
9. [Edge Functions](#edge-functions)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- A [Supabase](https://supabase.com/) account
- Node.js 18.x or later installed
- Basic knowledge of SQL and PostgreSQL
- The StockSync codebase cloned to your local machine

## Creating a Supabase Project

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter project details:
   - **Name**: StockSync (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to your users
4. Click "Create New Project" and wait for the project to be created (this may take a few minutes)

## Database Setup

### Option 1: Using the SQL Editor (Recommended)

1. In your Supabase project dashboard, navigate to the **SQL Editor** tab
2. Click "New Query"
3. Copy the entire contents of the `schema.sql` file from the StockSync repository
4. Paste the SQL into the editor
5. Click "Run" to execute the SQL script
6. Verify that all tables, functions, and triggers have been created successfully

### Option 2: Using the Supabase CLI

1. Install the Supabase CLI if you haven't already:
   \`\`\`bash
   npm install -g supabase
   \`\`\`

2. Login to Supabase:
   \`\`\`bash
   supabase login
   \`\`\`

3. Initialize Supabase in your project:
   \`\`\`bash
   supabase init
   \`\`\`

4. Link your project:
   \`\`\`bash
   supabase link --project-ref YOUR_PROJECT_REF
   \`\`\`
   (You can find your project reference in the Supabase dashboard URL)

5. Push the schema to your Supabase project:
   \`\`\`bash
   supabase db push
   \`\`\`

## Authentication Configuration

StockSync uses Supabase Auth for user authentication. Follow these steps to configure it:

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Ensure **Email** provider is enabled
3. Configure email templates:
   - Go to **Authentication** > **Email Templates**
   - Customize the templates for:
     - Confirmation email
     - Invitation email
     - Magic link email
     - Reset password email

4. Configure authentication settings:
   - Go to **Authentication** > **Settings**
   - Set **Site URL** to your application's URL (e.g., `http://localhost:3000` for development)
   - Enable **Confirm email** for added security
   - Configure other settings according to your requirements

## Storage Setup

StockSync uses Supabase Storage for storing product images and other files:

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:
   - `products` - for product images
   - `documents` - for order documents, invoices, etc.
   - `avatars` - for user profile pictures

3. Configure bucket permissions:
   - For each bucket, go to **Configuration** tab
   - Set appropriate RLS policies:

   For the `products` bucket:
   \`\`\`sql
   -- Allow authenticated users to view product images
   CREATE POLICY "Product images are viewable by authenticated users"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'products' AND auth.role() = 'authenticated');

   -- Allow authenticated users with admin or manager roles to upload product images
   CREATE POLICY "Product images are uploadable by admins and managers"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'products' AND
     auth.role() = 'authenticated' AND
     EXISTS (
       SELECT 1 FROM profiles
       WHERE id = auth.uid() AND role IN ('admin', 'manager')
     )
   );
   \`\`\`

   Configure similar policies for the other buckets based on your access requirements.

## Environment Variables

Set up the following environment variables in your StockSync project:

1. Create a `.env.local` file in the root of your project with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

You can find these values in your Supabase dashboard under **Settings** > **API**.

## Row Level Security (RLS) Policies

StockSync uses Row Level Security (RLS) to control access to data. The `schema.sql` file already includes RLS policies, but here's how to verify and modify them if needed:

1. Go to **Database** > **Tables** in your Supabase dashboard
2. Select a table (e.g., `products`)
3. Go to the **Policies** tab
4. Verify that the policies match those defined in `schema.sql`
5. If needed, add or modify policies using the UI or SQL editor

Example of checking RLS policies for the `products` table:

\`\`\`sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Add a new policy if needed
CREATE POLICY "Staff can view active products" 
ON products FOR SELECT 
USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'staff'
  )
);
\`\`\`

## Realtime Configuration

StockSync uses Supabase Realtime for live updates. The `schema.sql` file already includes the necessary publication, but here's how to verify and configure it:

1. Go to **Database** > **Replication** in your Supabase dashboard
2. Check if the `supabase_realtime` publication exists and includes the required tables
3. If needed, modify the publication:

\`\`\`sql
-- Check existing publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Modify publication if needed
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
\`\`\`

## Edge Functions

If your StockSync implementation uses Supabase Edge Functions, follow these steps to deploy them:

1. Install the Supabase CLI if you haven't already:
   \`\`\`bash
   npm install -g supabase
   \`\`\`

2. Navigate to the `supabase/functions` directory in your project:
   \`\`\`bash
   cd supabase/functions
   \`\`\`

3. Deploy the functions:
   \`\`\`bash
   supabase functions deploy --project-ref YOUR_PROJECT_REF
   \`\`\`

4. Verify the functions are deployed:
   \`\`\`bash
   supabase functions list --project-ref YOUR_PROJECT_REF
   \`\`\`

## Troubleshooting

### Common Issues and Solutions

#### Issue: Database Schema Errors During Setup

**Solution**: Check the SQL error messages carefully. Common issues include:
- Table already exists: Drop the table first or use `IF NOT EXISTS` in your CREATE TABLE statements
- Permission denied: Ensure you're using the correct Supabase credentials
- Syntax errors: PostgreSQL syntax might differ slightly from other SQL dialects

#### Issue: Authentication Not Working

**Solution**:
- Verify your environment variables are correctly set
- Check that the Site URL in Authentication settings matches your application URL
- Ensure email provider is enabled
- Check browser console for CORS errors

#### Issue: RLS Policies Blocking Access

**Solution**:
- Temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
- Use the Supabase dashboard to query data directly and bypass RLS
- Check the user's role and permissions
- Add logging to your policies to debug:

\`\`\`sql
CREATE OR REPLACE FUNCTION debug_rls() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO logs (message) VALUES ('RLS check: ' || auth.uid() || ' accessing ' || TG_TABLE_NAME);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER debug_rls_trigger
BEFORE SELECT ON products
FOR EACH ROW EXECUTE FUNCTION debug_rls();
\`\`\`

#### Issue: Realtime Updates Not Working

**Solution**:
- Ensure the table is included in the `supabase_realtime` publication
- Check that you're subscribing to the correct channel and table
- Verify that changes are being made to the database
- Check browser console for WebSocket connection errors

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues not covered in this guide, please:
1. Check the [StockSync GitHub Issues](https://github.com/yourusername/stocksync/issues)
2. Join the [Supabase Discord](https://discord.supabase.com/) for community support
3. Contact the StockSync maintainers at support@stocksync.com

---

This guide is maintained by the StockSync team and was last updated on June 1, 2025.
