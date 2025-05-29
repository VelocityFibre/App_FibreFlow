-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stock Categories Table
CREATE TABLE IF NOT EXISTS stock_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES stock_categories(id),
    icon_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Items Table
CREATE TABLE IF NOT EXISTS stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category_id UUID REFERENCES stock_categories(id),
    current_quantity NUMERIC(10, 2) DEFAULT 0,
    min_stock_level NUMERIC(10, 2) DEFAULT 0,
    max_stock_level NUMERIC(10, 2),
    reorder_point NUMERIC(10, 2),
    cost_per_unit NUMERIC(10, 2),
    last_purchase_price NUMERIC(10, 2),
    last_purchase_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Active',
    lead_time_days INTEGER,
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    specialties VARCHAR(255)[],
    performance_rating NUMERIC(3, 2),
    avg_lead_time_days INTEGER,
    payment_terms VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier-Stock Item Relationship Table
CREATE TABLE IF NOT EXISTS supplier_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    supplier_item_code VARCHAR(100),
    supplier_price NUMERIC(10, 2),
    last_quote_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(supplier_id, stock_item_id)
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    client VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Planning',
    project_manager VARCHAR(255),
    budget NUMERIC(14, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill of Quantities (BOQ) Table
CREATE TABLE IF NOT EXISTS boqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    boq_number VARCHAR(100) UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    creation_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Draft',
    created_by VARCHAR(255),
    approved_by VARCHAR(255),
    approval_date DATE,
    total_items INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BOQ Items Table
CREATE TABLE IF NOT EXISTS boq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_id UUID REFERENCES boqs(id) ON DELETE CASCADE,
    stock_item_id UUID REFERENCES stock_items(id),
    description TEXT,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50),
    unit_price NUMERIC(10, 2),
    extended_price NUMERIC(14, 2),
    status VARCHAR(50) DEFAULT 'Required',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Request for Quotation (RFQ) Table
CREATE TABLE IF NOT EXISTS rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_number VARCHAR(100) UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id),
    boq_id UUID REFERENCES boqs(id),
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Draft',
    created_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFQ-Supplier Relationship Table
CREATE TABLE IF NOT EXISTS rfq_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    sent_date TIMESTAMP WITH TIME ZONE,
    response_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rfq_id, supplier_id)
);

-- RFQ Items Table
CREATE TABLE IF NOT EXISTS rfq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
    boq_item_id UUID REFERENCES boq_items(id),
    stock_item_id UUID REFERENCES stock_items(id),
    quantity NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier Quotes Table
CREATE TABLE IF NOT EXISTS supplier_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_supplier_id UUID REFERENCES rfq_suppliers(id) ON DELETE CASCADE,
    rfq_item_id UUID REFERENCES rfq_items(id) ON DELETE CASCADE,
    quoted_unit_price NUMERIC(10, 2),
    quoted_quantity NUMERIC(10, 2),
    extended_price NUMERIC(14, 2),
    lead_time_days INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rfq_supplier_id, rfq_item_id)
);

-- Quote Comparison Reports Table
CREATE TABLE IF NOT EXISTS quote_comparison_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    cheapest_supplier_id UUID REFERENCES suppliers(id),
    total_cost_overall NUMERIC(14, 2),
    total_cost_optimal_mix NUMERIC(14, 2),
    optimal_mix_details JSONB,
    report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    project_id UUID REFERENCES projects(id),
    boq_id UUID REFERENCES boqs(id),
    supplier_id UUID REFERENCES suppliers(id),
    rfq_id UUID REFERENCES rfqs(id),
    issue_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'Draft',
    total_amount NUMERIC(14, 2),
    shipping_cost NUMERIC(10, 2),
    tax_amount NUMERIC(10, 2),
    grand_total NUMERIC(14, 2),
    payment_terms VARCHAR(100),
    created_by VARCHAR(255),
    approved_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS po_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    boq_item_id UUID REFERENCES boq_items(id),
    stock_item_id UUID REFERENCES stock_items(id),
    description TEXT,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    extended_price NUMERIC(14, 2),
    quantity_received NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movement_number VARCHAR(100) UNIQUE NOT NULL,
    stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    movement_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2),
    extended_price NUMERIC(14, 2),
    project_id UUID REFERENCES projects(id),
    po_id UUID REFERENCES purchase_orders(id),
    po_item_id UUID REFERENCES po_items(id),
    location_from VARCHAR(255),
    location_to VARCHAR(255),
    reference_number VARCHAR(100),
    created_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Locations Table
CREATE TABLE IF NOT EXISTS stock_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    is_warehouse BOOLEAN DEFAULT TRUE,
    is_project_site BOOLEAN DEFAULT FALSE,
    project_id UUID REFERENCES projects(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Item Locations (Inventory) Table
CREATE TABLE IF NOT EXISTS stock_item_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
    location_id UUID REFERENCES stock_locations(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stock_item_id, location_id)
);

-- Create Row Level Security (RLS) policies
ALTER TABLE stock_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE boqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_comparison_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_item_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated read access" ON stock_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert access" ON stock_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update access" ON stock_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete access" ON stock_categories FOR DELETE USING (auth.role() = 'authenticated');

-- Repeat similar policies for all tables
-- For brevity, not all policies are shown here but should be implemented for each table

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables
CREATE TRIGGER update_stock_categories_updated_at
BEFORE UPDATE ON stock_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Repeat similar triggers for all tables
-- For brevity, not all triggers are shown here but should be implemented for each table

-- Create function to update stock quantities when movements occur
CREATE OR REPLACE FUNCTION update_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type = 'Received' THEN
        UPDATE stock_items
        SET current_quantity = current_quantity + NEW.quantity,
            last_purchase_price = NEW.unit_price,
            last_purchase_date = NEW.movement_date
        WHERE id = NEW.stock_item_id;
        
        -- Update location quantity
        IF NEW.location_to IS NOT NULL THEN
            INSERT INTO stock_item_locations (stock_item_id, location_id, quantity)
            VALUES (NEW.stock_item_id, (SELECT id FROM stock_locations WHERE name = NEW.location_to), NEW.quantity)
            ON CONFLICT (stock_item_id, location_id) 
            DO UPDATE SET quantity = stock_item_locations.quantity + NEW.quantity;
        END IF;
    ELSIF NEW.movement_type = 'Issued' THEN
        UPDATE stock_items
        SET current_quantity = current_quantity - NEW.quantity
        WHERE id = NEW.stock_item_id;
        
        -- Update location quantity
        IF NEW.location_from IS NOT NULL THEN
            UPDATE stock_item_locations
            SET quantity = quantity - NEW.quantity
            WHERE stock_item_id = NEW.stock_item_id
            AND location_id = (SELECT id FROM stock_locations WHERE name = NEW.location_from);
        END IF;
    ELSIF NEW.movement_type = 'Returned' THEN
        UPDATE stock_items
        SET current_quantity = current_quantity + NEW.quantity
        WHERE id = NEW.stock_item_id;
        
        -- Update location quantity
        IF NEW.location_to IS NOT NULL THEN
            INSERT INTO stock_item_locations (stock_item_id, location_id, quantity)
            VALUES (NEW.stock_item_id, (SELECT id FROM stock_locations WHERE name = NEW.location_to), NEW.quantity)
            ON CONFLICT (stock_item_id, location_id) 
            DO UPDATE SET quantity = stock_item_locations.quantity + NEW.quantity;
        END IF;
    ELSIF NEW.movement_type = 'Adjusted' THEN
        -- For adjustments, the quantity can be positive or negative
        UPDATE stock_items
        SET current_quantity = current_quantity + NEW.quantity
        WHERE id = NEW.stock_item_id;
        
        -- Update location quantity
        IF NEW.location_to IS NOT NULL THEN
            INSERT INTO stock_item_locations (stock_item_id, location_id, quantity)
            VALUES (NEW.stock_item_id, (SELECT id FROM stock_locations WHERE name = NEW.location_to), NEW.quantity)
            ON CONFLICT (stock_item_id, location_id) 
            DO UPDATE SET quantity = stock_item_locations.quantity + NEW.quantity;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the stock update trigger
CREATE TRIGGER update_stock_on_movement
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_stock_quantity();

-- Create function to calculate extended price for BOQ items
CREATE OR REPLACE FUNCTION calculate_boq_item_extended_price()
RETURNS TRIGGER AS $$
BEGIN
    NEW.extended_price = NEW.quantity * NEW.unit_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the extended price trigger
CREATE TRIGGER calculate_boq_item_price
BEFORE INSERT OR UPDATE ON boq_items
FOR EACH ROW
EXECUTE FUNCTION calculate_boq_item_extended_price();

-- Create function to calculate extended price for supplier quotes
CREATE OR REPLACE FUNCTION calculate_quote_extended_price()
RETURNS TRIGGER AS $$
BEGIN
    NEW.extended_price = NEW.quoted_quantity * NEW.quoted_unit_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the extended price trigger
CREATE TRIGGER calculate_quote_price
BEFORE INSERT OR UPDATE ON supplier_quotes
FOR EACH ROW
EXECUTE FUNCTION calculate_quote_extended_price();

-- Create function to calculate extended price for PO items
CREATE OR REPLACE FUNCTION calculate_po_item_extended_price()
RETURNS TRIGGER AS $$
BEGIN
    NEW.extended_price = NEW.quantity * NEW.unit_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the extended price trigger
CREATE TRIGGER calculate_po_item_price
BEFORE INSERT OR UPDATE ON po_items
FOR EACH ROW
EXECUTE FUNCTION calculate_po_item_extended_price();
