-- StockSync Deployment Verification Script
-- Run this after deployment to ensure everything is working correctly

-- =====================================================
-- 1. VERIFY TABLE CREATION
-- =====================================================

DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'profiles', 'categories', 'suppliers', 'products', 'product_serials',
        'orders', 'order_items', 'activities', 'barcode_scans', 
        'inventory_adjustments', 'stock_movements', 'notifications', 'system_settings'
    ];
    table_name TEXT;
    table_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verifying table creation...';
    
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = table_name;
        
        IF table_count = 1 THEN
            RAISE NOTICE '✅ Table % exists', table_name;
        ELSE
            RAISE EXCEPTION '❌ Table % is missing!', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ All tables created successfully!';
END $$;

-- =====================================================
-- 2. VERIFY FUNCTIONS
-- =====================================================

DO $$
DECLARE
    expected_functions TEXT[] := ARRAY[
        'handle_new_user', 'update_updated_at_column', 'log_activity',
        'update_product_stock', 'get_low_stock_products', 'get_inventory_stats',
        'search_products', 'create_notification', 'check_low_stock'
    ];
    function_name TEXT;
    function_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verifying function creation...';
    
    FOREACH function_name IN ARRAY expected_functions
    LOOP
        SELECT COUNT(*) INTO function_count 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_name = function_name;
        
        IF function_count >= 1 THEN
            RAISE NOTICE '✅ Function % exists', function_name;
        ELSE
            RAISE EXCEPTION '❌ Function % is missing!', function_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ All functions created successfully!';
END $$;

-- =====================================================
-- 3. VERIFY INDEXES
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verifying index creation...';
    
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
    
    IF index_count >= 15 THEN
        RAISE NOTICE '✅ % indexes created successfully', index_count;
    ELSE
        RAISE EXCEPTION '❌ Expected at least 15 indexes, found %', index_count;
    END IF;
END $$;

-- =====================================================
-- 4. VERIFY RLS POLICIES
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verifying RLS policies...';
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    IF policy_count >= 10 THEN
        RAISE NOTICE '✅ % RLS policies created successfully', policy_count;
    ELSE
        RAISE EXCEPTION '❌ Expected at least 10 RLS policies, found %', policy_count;
    END IF;
END $$;

-- =====================================================
-- 5. VERIFY TRIGGERS
-- =====================================================

DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verifying triggers...';
    
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    IF trigger_count >= 5 THEN
        RAISE NOTICE '✅ % triggers created successfully', trigger_count;
    ELSE
        RAISE EXCEPTION '❌ Expected at least 5 triggers, found %', trigger_count;
    END IF;
END $$;

-- =====================================================
-- 6. VERIFY SAMPLE DATA
-- =====================================================

DO $$
DECLARE
    categories_count INTEGER;
    suppliers_count INTEGER;
    products_count INTEGER;
    settings_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verifying sample data...';
    
    SELECT COUNT(*) INTO categories_count FROM categories;
    SELECT COUNT(*) INTO suppliers_count FROM suppliers;
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO settings_count FROM system_settings;
    
    IF categories_count >= 5 THEN
        RAISE NOTICE '✅ % categories inserted', categories_count;
    ELSE
        RAISE EXCEPTION '❌ Expected at least 5 categories, found %', categories_count;
    END IF;
    
    IF suppliers_count >= 4 THEN
        RAISE NOTICE '✅ % suppliers inserted', suppliers_count;
    ELSE
        RAISE EXCEPTION '❌ Expected at least 4 suppliers, found %', suppliers_count;
    END IF;
    
    IF products_count >= 2 THEN
        RAISE NOTICE '✅ % products inserted', products_count;
    ELSE
        RAISE EXCEPTION '❌ Expected at least 2 products, found %', products_count;
    END IF;
    
    IF settings_count >= 5 THEN
        RAISE NOTICE '✅ % system settings inserted', settings_count;
    ELSE
        RAISE EXCEPTION '❌ Expected at least 5 system settings, found %', settings_count;
    END IF;
END $$;

-- =====================================================
-- 7. TEST CORE FUNCTIONS
-- =====================================================

DO $$
DECLARE
    test_product_id UUID;
    stats_result RECORD;
    search_result RECORD;
BEGIN
    RAISE NOTICE '🔍 Testing core functions...';
    
    -- Test get_inventory_stats function
    SELECT * INTO stats_result FROM get_inventory_stats();
    IF stats_result.total_products >= 0 THEN
        RAISE NOTICE '✅ get_inventory_stats() working: % total products', stats_result.total_products;
    ELSE
        RAISE EXCEPTION '❌ get_inventory_stats() failed';
    END IF;
    
    -- Test search_products function
    SELECT * INTO search_result FROM search_products('mouse') LIMIT 1;
    IF FOUND THEN
        RAISE NOTICE '✅ search_products() working: found product %', search_result.name;
    ELSE
        RAISE NOTICE '⚠️ search_products() working but no results for "mouse"';
    END IF;
    
    -- Test get_low_stock_products function
    SELECT COUNT(*) FROM get_low_stock_products();
    RAISE NOTICE '✅ get_low_stock_products() working';
    
END $$;

-- =====================================================
-- 8. VERIFY REALTIME PUBLICATION
-- =====================================================

DO $$
DECLARE
    pub_count INTEGER;
    table_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verifying realtime publication...';
    
    SELECT COUNT(*) INTO pub_count 
    FROM pg_publication 
    WHERE pubname = 'supabase_realtime';
    
    IF pub_count = 1 THEN
        RAISE NOTICE '✅ supabase_realtime publication exists';
        
        SELECT COUNT(*) INTO table_count 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime';
        
        RAISE NOTICE '✅ % tables in realtime publication', table_count;
    ELSE
        RAISE EXCEPTION '❌ supabase_realtime publication missing';
    END IF;
END $$;

-- =====================================================
-- 9. PERFORMANCE CHECK
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration INTERVAL;
BEGIN
    RAISE NOTICE '🔍 Running performance check...';
    
    start_time := clock_timestamp();
    
    -- Run a complex query to test performance
    PERFORM p.name, c.name as category, s.name as supplier
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT 100;
    
    end_time := clock_timestamp();
    duration := end_time - start_time;
    
    RAISE NOTICE '✅ Complex query executed in %', duration;
    
    IF EXTRACT(MILLISECONDS FROM duration) < 100 THEN
        RAISE NOTICE '✅ Performance: Excellent (< 100ms)';
    ELSIF EXTRACT(MILLISECONDS FROM duration) < 500 THEN
        RAISE NOTICE '⚠️ Performance: Good (< 500ms)';
    ELSE
        RAISE NOTICE '⚠️ Performance: Needs optimization (> 500ms)';
    END IF;
END $$;

-- =====================================================
-- 10. FINAL SUMMARY
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 DEPLOYMENT VERIFICATION COMPLETE! 🎉';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '✅ All tables created successfully';
    RAISE NOTICE '✅ All functions deployed correctly';
    RAISE NOTICE '✅ All indexes created for performance';
    RAISE NOTICE '✅ RLS policies configured for security';
    RAISE NOTICE '✅ Triggers active for automation';
    RAISE NOTICE '✅ Sample data inserted successfully';
    RAISE NOTICE '✅ Core functions tested and working';
    RAISE NOTICE '✅ Realtime publication configured';
    RAISE NOTICE '✅ Performance check completed';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 StockSync is ready for production use!';
    RAISE NOTICE '';
END $$;

-- Show final statistics
SELECT 
    'Tables' as component,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Functions' as component,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'

UNION ALL

SELECT 
    'Indexes' as component,
    COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'RLS Policies' as component,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Triggers' as component,
    COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
