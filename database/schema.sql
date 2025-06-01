-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE supplier_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE activity_action AS ENUM ('create', 'update', 'delete');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'staff',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  status supplier_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES categories(id),
  supplier_id UUID REFERENCES suppliers(id),
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  quantity INTEGER NOT NULL DEFAULT 0,
  threshold INTEGER DEFAULT 10,
  unit TEXT DEFAULT 'pcs',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (for audit trail)
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action activity_action NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID,
  item_name TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  user_name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory history table (for analytics)
CREATE TABLE inventory_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_value DECIMAL(12,2) NOT NULL,
  total_items INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: All authenticated users can read, admin/manager can modify
CREATE POLICY "Categories are viewable by authenticated users" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and managers can manage categories" ON categories FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Suppliers: All authenticated users can read, admin/manager can modify
CREATE POLICY "Suppliers are viewable by authenticated users" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and managers can manage suppliers" ON suppliers FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Products: All authenticated users can read, admin/manager can modify
CREATE POLICY "Products are viewable by authenticated users" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and managers can manage products" ON products FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Orders: All authenticated users can read and create, admin/manager can modify
CREATE POLICY "Orders are viewable by authenticated users" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin and managers can manage orders" ON orders FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Order items: Follow order permissions
CREATE POLICY "Order items are viewable by authenticated users" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create order items" ON order_items FOR INSERT TO authenticated WITH CHECK (true);

-- Activities: All authenticated users can read, system can insert
CREATE POLICY "Activities are viewable by authenticated users" ON activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert activities" ON activities FOR INSERT TO authenticated WITH CHECK (true);

-- Inventory history: All authenticated users can read
CREATE POLICY "Inventory history is viewable by authenticated users" ON inventory_history FOR SELECT TO authenticated USING (true);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update inventory after order
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products 
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Revert old quantity and apply new quantity
    UPDATE products 
    SET quantity = quantity + OLD.quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET quantity = quantity + OLD.quantity,
        updated_at = NOW()
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory updates
CREATE TRIGGER update_inventory_trigger
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_inventory_on_order();

-- Insert sample data
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and accessories'),
  ('Food', 'Food and beverage items'),
  ('Clothing', 'Apparel and accessories'),
  ('Office', 'Office supplies and equipment');

INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
  ('Tech Solutions Inc.', 'John Smith', 'john@techsolutions.com', '+1-555-0101', '123 Tech Street, Silicon Valley, CA'),
  ('Global Electronics', 'Sarah Johnson', 'sarah@globalelectronics.com', '+1-555-0102', '456 Electronics Ave, Austin, TX'),
  ('Office Depot Pro', 'Mike Wilson', 'mike@officedepotpro.com', '+1-555-0103', '789 Office Blvd, Chicago, IL');
