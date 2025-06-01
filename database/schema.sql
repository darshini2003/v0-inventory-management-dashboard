-- =====================================================
-- StockSync Inventory Management Database Schema
-- Complete schema with all functions and triggers
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE supplier_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE activity_action AS ENUM ('create', 'update', 'delete', 'scan', 'restock');
CREATE TYPE scan_operation AS ENUM ('lookup', 'add_stock', 'remove_stock', 'inventory_check');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'staff',
  department TEXT,
  phone TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'package',
  parent_id UUID REFERENCES public.categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  website TEXT,
  tax_id TEXT,
  payment_terms INTEGER DEFAULT 30,
  status supplier_status DEFAULT 'active',
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  upc TEXT,
  isbn TEXT,
  category_id UUID REFERENCES public.categories(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  brand TEXT,
  model TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10, 2) CHECK (cost >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
  threshold INTEGER NOT NULL DEFAULT 5 CHECK (threshold >= 0),
  max_stock INTEGER,
  unit TEXT NOT NULL DEFAULT 'units',
  weight DECIMAL(8, 3),
  dimensions JSONB, -- {length, width, height}
  location TEXT,
  bin_location TEXT,
  image_url TEXT,
  images JSONB DEFAULT '[]',
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_serialized BOOLEAN DEFAULT false,
  expiry_date DATE,
  last_counted TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Serial numbers table (for serialized products)
CREATE TABLE IF NOT EXISTS public.product_serials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  status TEXT DEFAULT 'available', -- available, sold, damaged, returned
  purchase_date DATE,
  warranty_expiry DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, serial_number)
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address JSONB,
  status order_status DEFAULT 'pending',
  order_type TEXT DEFAULT 'sale', -- sale, purchase, transfer, adjustment
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  shipping_method TEXT,
  tracking_number TEXT,
  notes TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  serial_numbers TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (audit trail)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action activity_action NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID,
  item_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_email TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barcode scans table
CREATE TABLE IF NOT EXISTS public.barcode_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barcode TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id),
  user_id UUID REFERENCES auth.users(id),
  operation scan_operation DEFAULT 'lookup',
  quantity_change INTEGER DEFAULT 0,
  location TEXT,
  device_info JSONB DEFAULT '{}',
  scan_duration INTEGER, -- milliseconds
  confidence_score DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory adjustments table
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id),
  adjustment_type TEXT NOT NULL, -- recount, damage, theft, expired, found
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  quantity_change INTEGER NOT NULL,
  reason TEXT,
  reference_number TEXT,
  cost_impact DECIMAL(10, 2),
  approved_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock movements table
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id),
  movement_type TEXT NOT NULL, -- in, out, transfer, adjustment
  quantity INTEGER NOT NULL,
  reference_type TEXT, -- order, adjustment, transfer
  reference_id UUID,
  from_location TEXT,
  to_location TEXT,
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, warning, error, success
  category TEXT DEFAULT 'general', -- low_stock, order, system, etc.
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_quantity ON public.products(quantity);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON public.products(quantity, threshold) WHERE quantity <= threshold;
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON public.orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_email);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_item ON public.activities(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_action ON public.activities(action);

-- Barcode scans indexes
CREATE INDEX IF NOT EXISTS idx_barcode_scans_barcode ON public.barcode_scans(barcode);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_product ON public.barcode_scans(product_id);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_user ON public.barcode_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_date ON public.barcode_scans(created_at);

-- Stock movements indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON public.stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON public.stock_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(created_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity(
  p_action activity_action,
  p_item_type TEXT,
  p_item_id UUID,
  p_item_name TEXT,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
  user_profile RECORD;
BEGIN
  -- Get user profile
  SELECT email, full_name INTO user_profile
  FROM public.profiles
  WHERE id = auth.uid();

  INSERT INTO public.activities (
    action,
    item_type,
    item_id,
    item_name,
    user_id,
    user_name,
    user_email,
    details
  ) VALUES (
    p_action,
    p_item_type,
    p_item_id,
    p_item_name,
    auth.uid(),
    COALESCE(user_profile.full_name, user_profile.email, 'Unknown'),
    user_profile.email,
    p_details
  ) RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(
  p_product_id UUID,
  p_quantity_change INTEGER,
  p_movement_type TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_quantity INTEGER;
  new_quantity INTEGER;
  product_name TEXT;
  unit_cost DECIMAL(10, 2);
BEGIN
  -- Get current product info
  SELECT quantity, name, cost INTO current_quantity, product_name, unit_cost
  FROM public.products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  new_quantity := current_quantity + p_quantity_change;

  IF new_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', current_quantity, ABS(p_quantity_change);
  END IF;

  -- Update product quantity
  UPDATE public.products
  SET quantity = new_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;

  -- Log stock movement
  INSERT INTO public.stock_movements (
    product_id,
    movement_type,
    quantity,
    reference_type,
    reference_id,
    unit_cost,
    total_cost,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    p_movement_type,
    p_quantity_change,
    p_reference_type,
    p_reference_id,
    unit_cost,
    unit_cost * ABS(p_quantity_change),
    p_notes,
    auth.uid()
  );

  -- Log activity
  PERFORM log_activity(
    'update',
    'product',
    p_product_id,
    product_name,
    jsonb_build_object(
      'old_quantity', current_quantity,
      'new_quantity', new_quantity,
      'change', p_quantity_change,
      'movement_type', p_movement_type
    )
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE (
  id UUID,
  name TEXT,
  sku TEXT,
  quantity INTEGER,
  threshold INTEGER,
  category_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.quantity,
    p.threshold,
    c.name as category_name
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE p.quantity <= p.threshold
    AND p.is_active = true
  ORDER BY (p.quantity::FLOAT / NULLIF(p.threshold, 0)) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get inventory statistics
CREATE OR REPLACE FUNCTION get_inventory_stats()
RETURNS TABLE (
  total_products BIGINT,
  total_value DECIMAL,
  low_stock_count BIGINT,
  out_of_stock_count BIGINT,
  total_quantity BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_products,
    COALESCE(SUM(quantity * price), 0) as total_value,
    COUNT(*) FILTER (WHERE quantity <= threshold AND quantity > 0) as low_stock_count,
    COUNT(*) FILTER (WHERE quantity = 0) as out_of_stock_count,
    COALESCE(SUM(quantity), 0) as total_quantity
  FROM public.products
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search products
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  sku TEXT,
  barcode TEXT,
  quantity INTEGER,
  price DECIMAL,
  category_name TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.barcode,
    p.quantity,
    p.price,
    c.name as category_name,
    ts_rank(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', search_term)) as rank
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE p.is_active = true
    AND (
      p.name ILIKE '%' || search_term || '%'
      OR p.sku ILIKE '%' || search_term || '%'
      OR p.barcode = search_term
      OR to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_term)
    )
  ORDER BY 
    CASE WHEN p.barcode = search_term THEN 1 ELSE 2 END,
    CASE WHEN p.sku ILIKE search_term || '%' THEN 1 ELSE 2 END,
    rank DESC,
    p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_category TEXT DEFAULT 'general',
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    data
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_category,
    p_data
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for low stock notifications
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  admin_users UUID[];
  admin_user UUID;
BEGIN
  -- Check if product went below threshold
  IF NEW.quantity <= NEW.threshold AND OLD.quantity > OLD.threshold THEN
    -- Get all admin users
    SELECT ARRAY_AGG(id) INTO admin_users
    FROM public.profiles
    WHERE role = 'admin';

    -- Create notifications for admin users
    FOREACH admin_user IN ARRAY admin_users
    LOOP
      PERFORM create_notification(
        admin_user,
        'Low Stock Alert',
        'Product "' || NEW.name || '" is running low. Current stock: ' || NEW.quantity || ' ' || NEW.unit,
        'warning',
        'low_stock',
        jsonb_build_object(
          'product_id', NEW.id,
          'product_name', NEW.name,
          'current_quantity', NEW.quantity,
          'threshold', NEW.threshold
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS low_stock_notification_trigger ON public.products;
CREATE TRIGGER low_stock_notification_trigger
  AFTER UPDATE OF quantity ON public.products
  FOR EACH ROW
  WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
  EXECUTE FUNCTION check_low_stock();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barcode_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin users can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products policies
CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and manager users can manage products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Categories policies
CREATE POLICY "Authenticated users can view categories" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and manager users can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Suppliers policies
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and manager users can manage suppliers" ON public.suppliers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Orders policies
CREATE POLICY "Authenticated users can view orders" ON public.orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin and manager users can manage orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Activities policies
CREATE POLICY "Authenticated users can view activities" ON public.activities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert activities" ON public.activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Barcode scans policies
CREATE POLICY "Authenticated users can view barcode scans" ON public.barcode_scans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create barcode scans" ON public.barcode_scans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System settings policies
CREATE POLICY "Admin users can manage system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can view public settings" ON public.system_settings
  FOR SELECT USING (is_public = true AND auth.role() = 'authenticated');

-- =====================================================
-- REALTIME PUBLICATION
-- =====================================================

-- Drop existing publication
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create publication for realtime
CREATE PUBLICATION supabase_realtime FOR TABLE 
  public.products,
  public.orders,
  public.order_items,
  public.activities,
  public.barcode_scans,
  public.notifications,
  public.stock_movements;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample categories
INSERT INTO public.categories (name, description, color, icon) VALUES
  ('Electronics', 'Electronic devices and accessories', '#3b82f6', 'smartphone'),
  ('Office Supplies', 'Office stationery and supplies', '#10b981', 'briefcase'),
  ('Furniture', 'Office and home furniture', '#f59e0b', 'home'),
  ('Books', 'Books and educational materials', '#8b5cf6', 'book'),
  ('Clothing', 'Apparel and accessories', '#ef4444', 'shirt')
ON CONFLICT (name) DO NOTHING;

-- Insert sample suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address, city, state, status) VALUES
  ('Tech Solutions Inc.', 'John Smith', 'john@techsolutions.com', '555-1234', '123 Tech Street', 'San Francisco', 'CA', 'active'),
  ('Office Depot Pro', 'Sarah Johnson', 'sarah@officedepot.com', '555-5678', '456 Office Blvd', 'Chicago', 'IL', 'active'),
  ('Furniture World', 'Mike Brown', 'mike@furnitureworld.com', '555-9012', '789 Furniture Ave', 'New York', 'NY', 'active'),
  ('Book Distributors', 'Lisa Davis', 'lisa@bookdist.com', '555-3456', '321 Book Lane', 'Boston', 'MA', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO public.products (name, description, sku, barcode, category_id, supplier_id, price, cost, quantity, threshold, unit) 
SELECT 
  'Wireless Mouse',
  'Ergonomic wireless mouse with USB receiver',
  'WM-001',
  '1234567890123',
  c.id,
  s.id,
  29.99,
  15.00,
  50,
  10,
  'units'
FROM public.categories c, public.suppliers s
WHERE c.name = 'Electronics' AND s.name = 'Tech Solutions Inc.'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, sku, barcode, category_id, supplier_id, price, cost, quantity, threshold, unit)
SELECT 
  'Office Chair',
  'Ergonomic office chair with lumbar support',
  'OC-001',
  '2345678901234',
  c.id,
  s.id,
  199.99,
  120.00,
  25,
  5,
  'units'
FROM public.categories c, public.suppliers s
WHERE c.name = 'Furniture' AND s.name = 'Furniture World'
ON CONFLICT (sku) DO NOTHING;

-- Insert system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
  ('company_name', '"StockSync"', 'Company name', 'general', true),
  ('default_currency', '"USD"', 'Default currency', 'general', true),
  ('low_stock_threshold', '5', 'Default low stock threshold', 'inventory', false),
  ('enable_barcode_scanning', 'true', 'Enable barcode scanning feature', 'features', false),
  ('enable_realtime_updates', 'true', 'Enable real-time updates', 'features', false)
ON CONFLICT (key) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Refresh the schema
NOTIFY pgrst, 'reload schema';
