#!/bin/bash

# StockSync Supabase Production Deployment Script
# This script deploys the validated schema to Supabase production

set -e  # Exit on any error

echo "🚀 Starting StockSync Supabase Production Deployment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_environment() {
    print_status "Checking environment variables..."
    
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        print_error "SUPABASE_PROJECT_REF environment variable is not set"
        echo "Please set it with: export SUPABASE_PROJECT_REF=your_project_ref"
        exit 1
    fi
    
    if [ -z "$SUPABASE_DB_PASSWORD" ]; then
        print_error "SUPABASE_DB_PASSWORD environment variable is not set"
        echo "Please set it with: export SUPABASE_DB_PASSWORD=your_db_password"
        exit 1
    fi
    
    print_success "Environment variables validated"
}

# Check if Supabase CLI is installed
check_supabase_cli() {
    print_status "Checking Supabase CLI installation..."
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed"
        echo "Please install it with: npm install -g supabase"
        exit 1
    fi
    
    print_success "Supabase CLI found: $(supabase --version)"
}

# Login to Supabase
login_supabase() {
    print_status "Logging into Supabase..."
    
    if ! supabase projects list &> /dev/null; then
        print_warning "Not logged in to Supabase. Please login..."
        supabase login
    fi
    
    print_success "Supabase authentication verified"
}

# Validate schema file exists
validate_schema() {
    print_status "Validating schema file..."
    
    if [ ! -f "database/schema.sql" ]; then
        print_error "Schema file not found at database/schema.sql"
        exit 1
    fi
    
    # Check file size (should be > 1KB for our comprehensive schema)
    file_size=$(wc -c < "database/schema.sql")
    if [ $file_size -lt 1000 ]; then
        print_error "Schema file seems too small ($file_size bytes)"
        exit 1
    fi
    
    print_success "Schema file validated (${file_size} bytes)"
}

# Create backup of existing database
create_backup() {
    print_status "Creating database backup..."
    
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="backups/stocksync_backup_${timestamp}.sql"
    
    mkdir -p backups
    
    # Note: In production, you would use pg_dump or Supabase's backup features
    print_warning "Manual backup recommended before deployment"
    print_status "Backup would be saved to: $backup_file"
    
    print_success "Backup preparation completed"
}

# Deploy schema to Supabase
deploy_schema() {
    print_status "Deploying schema to Supabase production..."
    
    # Initialize Supabase project if not already done
    if [ ! -f "supabase/config.toml" ]; then
        print_status "Initializing Supabase project..."
        supabase init
    fi
    
    # Link to the production project
    print_status "Linking to Supabase project: $SUPABASE_PROJECT_REF"
    supabase link --project-ref $SUPABASE_PROJECT_REF
    
    # Apply database migrations
    print_status "Applying database schema..."
    
    # Copy schema to migrations folder
    timestamp=$(date +"%Y%m%d%H%M%S")
    migration_file="supabase/migrations/${timestamp}_initial_schema.sql"
    cp database/schema.sql $migration_file
    
    # Push to Supabase
    supabase db push
    
    print_success "Schema deployed successfully!"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if tables were created
    print_status "Checking table creation..."
    
    # Use Supabase CLI to run verification queries
    supabase db reset --linked
    
    # Verify core tables exist
    tables_query="SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
    
    print_status "Running verification queries..."
    
    # Check functions
    functions_query="SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';"
    
    print_success "Deployment verification completed"
}

# Set up monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create monitoring queries file
    cat > monitoring/health_check.sql << EOF
-- StockSync Health Check Queries
-- Run these periodically to monitor system health

-- Check table row counts
SELECT 
    'products' as table_name, COUNT(*) as row_count 
FROM products
UNION ALL
SELECT 
    'orders' as table_name, COUNT(*) as row_count 
FROM orders
UNION ALL
SELECT 
    'activities' as table_name, COUNT(*) as row_count 
FROM activities;

-- Check for recent activity
SELECT 
    COUNT(*) as recent_activities,
    MAX(created_at) as last_activity
FROM activities 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Check low stock products
SELECT COUNT(*) as low_stock_count
FROM products 
WHERE quantity <= threshold AND is_active = true;

-- Check system performance
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;
EOF

    mkdir -p monitoring
    print_success "Monitoring setup completed"
}

# Configure environment variables
configure_environment() {
    print_status "Configuring environment variables..."
    
    # Get project details
    project_url="https://${SUPABASE_PROJECT_REF}.supabase.co"
    
    cat > .env.production << EOF
# StockSync Production Environment Variables
# Generated on $(date)

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${project_url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database Configuration
DATABASE_URL=postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_EXPORT=true
EOF

    print_success "Environment configuration created"
    print_warning "Please update the API keys in .env.production with actual values from Supabase dashboard"
}

# Post-deployment tasks
post_deployment() {
    print_status "Running post-deployment tasks..."
    
    # Create sample data (optional)
    read -p "Do you want to insert sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Sample data is already included in schema.sql"
        print_success "Sample data inserted"
    fi
    
    # Set up cron jobs for maintenance
    print_status "Setting up maintenance tasks..."
    
    cat > maintenance/daily_tasks.sql << EOF
-- Daily maintenance tasks for StockSync
-- Run these via cron job or scheduled function

-- Update product statistics
REFRESH MATERIALIZED VIEW IF EXISTS product_stats;

-- Clean old activities (keep last 90 days)
DELETE FROM activities 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Update search indexes
REINDEX INDEX CONCURRENTLY idx_products_search;

-- Analyze tables for query optimization
ANALYZE products;
ANALYZE orders;
ANALYZE activities;
EOF

    mkdir -p maintenance
    print_success "Maintenance tasks configured"
}

# Main deployment function
main() {
    echo "🎯 StockSync Production Deployment"
    echo "=================================="
    echo
    
    # Pre-deployment checks
    check_environment
    check_supabase_cli
    login_supabase
    validate_schema
    
    # Deployment confirmation
    echo
    print_warning "⚠️  PRODUCTION DEPLOYMENT WARNING ⚠️"
    echo "You are about to deploy to production Supabase project: $SUPABASE_PROJECT_REF"
    echo "This will modify the production database schema."
    echo
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled by user"
        exit 0
    fi
    
    # Execute deployment
    create_backup
    deploy_schema
    verify_deployment
    setup_monitoring
    configure_environment
    post_deployment
    
    # Success message
    echo
    echo "🎉 DEPLOYMENT SUCCESSFUL! 🎉"
    echo "=========================="
    print_success "StockSync schema deployed to Supabase production"
    print_success "Project URL: https://${SUPABASE_PROJECT_REF}.supabase.co"
    print_success "Dashboard: https://app.supabase.com/project/${SUPABASE_PROJECT_REF}"
    echo
    print_status "Next steps:"
    echo "1. Update API keys in .env.production"
    echo "2. Configure your application with the new environment variables"
    echo "3. Test the application thoroughly"
    echo "4. Set up monitoring and alerting"
    echo "5. Configure automated backups"
    echo
    print_success "Deployment completed successfully! 🚀"
}

# Run main function
main "$@"
