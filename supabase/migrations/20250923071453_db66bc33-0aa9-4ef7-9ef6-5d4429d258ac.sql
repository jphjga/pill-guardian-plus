-- Insert sample medications
INSERT INTO public.medications (name, generic_name, brand_name, category, dosage, form, manufacturer, price, cost, description) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Tylenol', 'Pain Relief', '500mg', 'Tablet', 'Johnson & Johnson', 12.99, 8.50, 'Common pain reliever and fever reducer'),
('Amoxicillin 250mg', 'Amoxicillin', 'Amoxil', 'Antibiotics', '250mg', 'Capsule', 'GlaxoSmithKline', 24.50, 15.75, 'Broad-spectrum antibiotic for bacterial infections'),
('Insulin Pen', 'Insulin Aspart', 'NovoRapid', 'Diabetes', '100 units/ml', 'Injection', 'Novo Nordisk', 89.99, 65.00, 'Fast-acting insulin for diabetes management'),
('Vitamin D3 1000IU', 'Cholecalciferol', 'Nature Made', 'Vitamins', '1000 IU', 'Tablet', 'Pharmavite', 18.75, 12.00, 'Essential vitamin for bone health'),
('Blood Pressure Monitor', 'N/A', 'Omron', 'Medical Devices', 'N/A', 'Device', 'Omron Healthcare', 125.00, 85.00, 'Digital blood pressure monitoring device'),
('Aspirin 81mg', 'Aspirin', 'Bayer', 'Cardiovascular', '81mg', 'Tablet', 'Bayer', 8.99, 5.50, 'Low-dose aspirin for heart health'),
('Metformin 500mg', 'Metformin', 'Glucophage', 'Diabetes', '500mg', 'Tablet', 'Bristol Myers Squibb', 32.00, 22.00, 'Oral diabetes medication');

-- Insert sample inventory for the medications
INSERT INTO public.inventory (medication_id, current_stock, minimum_stock, maximum_stock, supplier, location) 
SELECT 
  m.id,
  CASE 
    WHEN m.name LIKE '%Amoxicillin%' THEN 15
    WHEN m.name LIKE '%Insulin%' THEN 8
    WHEN m.name LIKE '%Blood Pressure%' THEN 3
    WHEN m.name LIKE '%Paracetamol%' THEN 150
    WHEN m.name LIKE '%Vitamin D3%' THEN 200
    WHEN m.name LIKE '%Aspirin%' THEN 85
    WHEN m.name LIKE '%Metformin%' THEN 45
    ELSE 50
  END,
  CASE 
    WHEN m.name LIKE '%Insulin%' THEN 25
    WHEN m.name LIKE '%Blood Pressure%' THEN 10
    ELSE 50
  END,
  CASE 
    WHEN m.name LIKE '%Blood Pressure%' THEN 50
    ELSE 1000
  END,
  CASE 
    WHEN m.name LIKE '%Johnson%' THEN 'MedSupply Corp'
    WHEN m.name LIKE '%GlaxoSmithKline%' THEN 'PharmaDist Inc'
    WHEN m.name LIKE '%Novo Nordisk%' THEN 'Specialty Pharma'
    WHEN m.name LIKE '%Pharmavite%' THEN 'VitaSupply Co'
    WHEN m.name LIKE '%Omron%' THEN 'MedTech Solutions'
    WHEN m.name LIKE '%Bayer%' THEN 'Bayer Direct'
    ELSE 'General Pharma Supply'
  END,
  CASE 
    WHEN m.category = 'Pain Relief' THEN 'Aisle A - Shelf 1'
    WHEN m.category = 'Antibiotics' THEN 'Aisle B - Shelf 2'
    WHEN m.category = 'Diabetes' THEN 'Refrigerated Section'
    WHEN m.category = 'Vitamins' THEN 'Aisle C - Shelf 1'
    WHEN m.category = 'Medical Devices' THEN 'Storage Room A'
    WHEN m.category = 'Cardiovascular' THEN 'Aisle A - Shelf 3'
    ELSE 'General Storage'
  END
FROM public.medications m;

-- Insert sample customers
INSERT INTO public.customers (first_name, last_name, email, phone, address, date_of_birth, insurance_provider, insurance_number) VALUES
('John', 'Smith', 'john.smith@email.com', '+1 (555) 123-4567', '123 Main St, Anytown, ST 12345', '1985-03-15', 'HealthCare Plus', 'HC123456789'),
('Sarah', 'Johnson', 'sarah.j@email.com', '+1 (555) 987-6543', '456 Oak Ave, Springfield, ST 67890', '1978-11-22', 'MediCare Pro', 'MP987654321'),
('Michael', 'Brown', 'm.brown@email.com', '+1 (555) 456-7890', '789 Pine Rd, Riverside, ST 13579', '1990-07-08', 'Universal Health', 'UH456789123'),
('Emily', 'Davis', 'emily.davis@email.com', '+1 (555) 234-5678', '321 Elm St, Lakeside, ST 24680', '1992-09-30', 'Prime Insurance', 'PI234567890'),
('Robert', 'Wilson', 'r.wilson@email.com', '+1 (555) 345-6789', '654 Maple Dr, Hillside, ST 97531', '1975-12-10', 'HealthCare Plus', 'HC345678901');

-- Insert sample orders
INSERT INTO public.orders (customer_id, status, total_amount, prescription_number, doctor_name, notes, copay, insurance_coverage)
SELECT 
  c.id,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'pending'
    WHEN RANDOM() < 0.6 THEN 'processing'
    WHEN RANDOM() < 0.9 THEN 'completed'
    ELSE 'cancelled'
  END,
  (RANDOM() * 200 + 20)::DECIMAL(10,2),
  'RX' || LPAD((ROW_NUMBER() OVER())::TEXT, 6, '0'),
  CASE (RANDOM() * 5)::INT
    WHEN 0 THEN 'Dr. Amanda Foster'
    WHEN 1 THEN 'Dr. Marcus Chen'
    WHEN 2 THEN 'Dr. Sarah Williams'
    WHEN 3 THEN 'Dr. David Rodriguez'
    ELSE 'Dr. Jennifer Lee'
  END,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Urgent delivery required'
    WHEN RANDOM() < 0.6 THEN 'Patient has allergies to penicillin'
    ELSE NULL
  END,
  (RANDOM() * 30 + 5)::DECIMAL(10,2),
  (RANDOM() * 150 + 50)::DECIMAL(10,2)
FROM public.customers c
CROSS JOIN generate_series(1, 3) -- Generate 3 orders per customer
LIMIT 12; -- Limit to reasonable number of orders

-- Insert sample alerts
INSERT INTO public.alerts (type, title, message, severity, medication_id)
SELECT 
  'low_stock',
  'Low Stock Alert',
  'Stock is running low for ' || m.name || ' (' || i.current_stock || ' units remaining)',
  CASE 
    WHEN i.current_stock <= i.minimum_stock * 0.3 THEN 'critical'
    WHEN i.current_stock <= i.minimum_stock * 0.6 THEN 'high'
    ELSE 'medium'
  END,
  m.id
FROM public.medications m
JOIN public.inventory i ON m.id = i.medication_id
WHERE i.current_stock <= i.minimum_stock
LIMIT 5;

-- Insert system alerts
INSERT INTO public.alerts (type, title, message, severity) VALUES
('system', 'Daily Backup Complete', 'System backup completed successfully at 2:00 AM', 'low'),
('expiry', 'Medication Expiry Warning', 'Several medications are approaching expiry dates', 'medium'),
('order', 'High Order Volume', 'Unusually high number of orders today - consider additional staffing', 'medium');