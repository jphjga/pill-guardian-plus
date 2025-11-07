# PharmaCare - Pharmacy Inventory Management System
## Complete Development Report & Architecture Documentation

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Security Model](#security-model)
9. [Features & Modules](#features--modules)
10. [API Integration](#api-integration)
11. [Mobile & Native Features](#mobile--native-features)
12. [Deployment](#deployment)
13. [Development Setup](#development-setup)

---

## Executive Summary

PharmaCare is a comprehensive pharmacy inventory management system built with modern web technologies. The application provides a multi-tenant, role-based platform for managing medications, inventory, customers, orders, and sales operations. It features real-time notifications, alerts management, native mobile capabilities with barcode scanning, and comprehensive reporting capabilities.

**Key Capabilities:**
- Multi-tenant organization support
- Role-based access control (Administrator, Manager, Pharmacist, Technician)
- Real-time inventory tracking with low-stock alerts
- Customer/Patient management with medical history
- Point-of-sale checkout system with barcode scanning
- Native mobile app support (iOS & Android)
- Camera-based medication lookup via barcode
- Prescription order management
- Internal notifications and system alerts
- Comprehensive dashboard with analytics

---

## Technology Stack

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router DOM 6.30.1
- **State Management:** TanStack React Query 5.83.0
- **UI Components:** shadcn-ui (Radix UI primitives)
- **Styling:** Tailwind CSS with custom design tokens
- **Forms:** React Hook Form 7.61.1 + Zod validation
- **Icons:** Lucide React 0.462.0
- **Notifications:** Sonner + Custom Toast system

### Backend
- **Database:** PostgreSQL (via Supabase)
- **Backend-as-a-Service:** Supabase
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime
- **API:** Supabase Auto-generated REST API

### Mobile & Native
- **Framework:** Capacitor 6+
- **Barcode Scanning:** @capacitor-mlkit/barcode-scanning
- **Platform Support:** iOS, Android
- **Native Capabilities:** Camera access, device storage, network detection

### Development Tools
- **Package Manager:** npm
- **Version Control:** Git
- **Deployment:** Azure App Service (configured)
- **Code Quality:** ESLint

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Application (SPA)                             │  │
│  │  - Components (UI)                                   │  │
│  │  - Pages (Routes)                                    │  │
│  │  - Hooks (Business Logic)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │  Realtime    │  │  REST API    │     │
│  │   Service    │  │  Subscriptions│ │  (PostgREST) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database                          │   │
│  │  - Tables (Data)                                     │   │
│  │  - RLS Policies (Security)                           │   │
│  │  - Functions (Business Logic)                        │   │
│  │  - Triggers (Automation)                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Application Flow

```
User → Login (Auth) → Organization Detection → Role Assignment → 
Feature Access (RLS) → Dashboard → Module Navigation → 
CRUD Operations → Real-time Updates
```

---

## Database Schema

### Entity Relationship Overview

```
auth.users (Supabase Managed)
    │
    └─> profiles (1:1) ──┬─> notifications (1:N)
                          │
                          └─> role_change_requests (1:N)

organizations (Implicit via organization field)
    │
    ├─> medications ──┬─> inventory (1:1)
    │                 ├─> order_items (1:N)
    │                 ├─> sale_items (1:N)
    │                 └─> alerts (1:N)
    │
    ├─> customers ──┬─> orders (1:N)
    │               └─> sales (1:N)
    │
    ├─> orders ──┬─> order_items (1:N)
    │            └─> alerts (1:N)
    │
    └─> sales ──> sale_items (1:N)
```

### Detailed Table Schemas

#### 1. **profiles**
User profile information linked to authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Profile ID |
| user_id | uuid | NOT NULL, UNIQUE | Foreign key to auth.users |
| full_name | text | nullable | User's full name |
| email | text | nullable | Email address |
| organization | text | nullable | Organization name |
| role | text | DEFAULT 'pharmacist' | User role in organization |
| avatar_url | text | nullable | Profile picture URL |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:** user_id (unique), organization

#### 2. **user_roles**
Separate table for role management (security best practice).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Role assignment ID |
| user_id | uuid | NOT NULL | User ID |
| role | app_role enum | NOT NULL | Role type |
| organization | text | NOT NULL | Organization |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Enum:** app_role = 'administrator' | 'manager' | 'pharmacist' | 'technician'

#### 3. **medications**
Master medication database.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Medication ID |
| name | text | NOT NULL | Medication name |
| generic_name | text | nullable | Generic name |
| brand_name | text | nullable | Brand name |
| category | text | nullable | Drug category |
| dosage | text | nullable | Dosage information |
| form | text | nullable | Form (tablet, liquid, etc.) |
| description | text | nullable | Description |
| manufacturer | text | nullable | Manufacturer name |
| ndc_number | text | nullable | National Drug Code |
| barcode | text | nullable | Barcode/SKU |
| lot_number | text | nullable | Lot number |
| price | numeric | nullable | Selling price |
| cost | numeric | nullable | Cost price |
| expiry_date | date | nullable | Expiration date |
| organization | text | nullable | Organization |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

#### 4. **inventory**
Stock levels and inventory management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Inventory record ID |
| medication_id | uuid | NOT NULL | FK to medications |
| current_stock | integer | DEFAULT 0 | Current quantity |
| minimum_stock | integer | DEFAULT 10 | Reorder threshold |
| maximum_stock | integer | DEFAULT 1000 | Maximum capacity |
| location | text | nullable | Storage location |
| supplier | text | nullable | Supplier name |
| last_restocked | date | nullable | Last restock date |
| organization | text | nullable | Organization |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

#### 5. **customers**
Patient/customer records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Customer ID |
| first_name | text | NOT NULL | First name |
| last_name | text | NOT NULL | Last name |
| email | text | nullable | Email address |
| phone | text | nullable | Phone number |
| date_of_birth | date | nullable | Date of birth |
| address | text | nullable | Physical address |
| allergies | text[] | nullable | List of allergies |
| medical_conditions | text[] | nullable | Medical conditions |
| insurance_provider | text | nullable | Insurance company |
| insurance_number | text | nullable | Insurance ID |
| organization | text | nullable | Organization |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

#### 6. **orders**
Prescription orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Order ID |
| customer_id | uuid | NOT NULL | FK to customers |
| prescription_number | text | nullable | Prescription number |
| doctor_name | text | nullable | Prescribing doctor |
| status | text | DEFAULT 'pending' | Order status |
| total_amount | numeric | nullable | Total cost |
| insurance_coverage | numeric | nullable | Insurance coverage |
| copay | numeric | nullable | Customer copay |
| notes | text | nullable | Additional notes |
| organization | text | nullable | Organization |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

#### 7. **order_items**
Line items for orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Order item ID |
| order_id | uuid | NOT NULL | FK to orders |
| medication_id | uuid | NOT NULL | FK to medications |
| quantity | integer | NOT NULL | Quantity ordered |
| unit_price | numeric | nullable | Price per unit |
| total_price | numeric | nullable | Total line price |
| instructions | text | nullable | Usage instructions |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

#### 8. **sales**
Point-of-sale transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Sale ID |
| customer_id | uuid | nullable | FK to customers |
| created_by | uuid | NOT NULL | User who processed sale |
| total_amount | numeric | DEFAULT 0 | Total sale amount |
| payment_method | text | DEFAULT 'cash' | Payment method |
| notes | text | nullable | Sale notes |
| organization | text | NOT NULL | Organization |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

#### 9. **sale_items**
Line items for sales.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Sale item ID |
| sale_id | uuid | NOT NULL | FK to sales |
| medication_id | uuid | NOT NULL | FK to medications |
| quantity | integer | NOT NULL | Quantity sold |
| unit_price | numeric | NOT NULL | Price per unit |
| total_price | numeric | NOT NULL | Total line price |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

#### 10. **alerts**
System-generated alerts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Alert ID |
| type | text | NOT NULL | Alert type |
| title | text | NOT NULL | Alert title |
| message | text | NOT NULL | Alert message |
| severity | text | DEFAULT 'medium' | Severity level |
| medication_id | uuid | nullable | Related medication |
| order_id | uuid | nullable | Related order |
| is_read | boolean | DEFAULT false | Read status |
| organization | text | nullable | Organization |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

#### 11. **notifications**
User-to-user notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Notification ID |
| user_id | uuid | NOT NULL | Recipient user ID |
| sender_id | uuid | nullable | Sender user ID |
| type | text | NOT NULL | Notification type |
| title | text | NOT NULL | Notification title |
| message | text | NOT NULL | Notification message |
| data | jsonb | nullable | Additional data payload |
| is_read | boolean | DEFAULT false | Read status |
| organization | text | NOT NULL | Organization |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

#### 12. **role_change_requests**
User role change requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Request ID |
| user_id | uuid | NOT NULL | Requesting user ID |
| from_role | text | NOT NULL | Current role |
| to_role | text | NOT NULL | Requested role |
| status | text | DEFAULT 'pending' | Request status |
| reason | text | nullable | Request justification |
| admin_response | text | nullable | Admin response |
| requested_by_name | text | NOT NULL | User's name |
| requested_by_email | text | NOT NULL | User's email |
| processed_by | uuid | nullable | Admin who processed |
| processed_at | timestamptz | nullable | Processing timestamp |
| organization | text | NOT NULL | Organization |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

### Database Functions

#### 1. **get_user_organization(_user_id uuid)**
Returns the organization for a given user.

```sql
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT organization
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;
```

#### 2. **get_user_organization_safe(_user_id uuid)**
Safely returns organization without triggering RLS recursion.

```sql
CREATE OR REPLACE FUNCTION public.get_user_organization_safe(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT organization
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;
```

#### 3. **has_role(_user_id uuid, _role app_role, _organization text)**
Checks if a user has a specific role in an organization.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role, _organization text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND organization = _organization
  )
$$;
```

#### 4. **is_admin_in_organization(target_org text)**
Checks if the current user is an admin in the specified organization.

```sql
CREATE OR REPLACE FUNCTION public.is_admin_in_organization(target_org text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'administrator'
      AND organization = target_org
  )
$$;
```

#### 5. **handle_new_user()**
Trigger function to create profile on user signup.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role text;
  org_exists boolean;
BEGIN
  -- Check if organization already exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE organization = COALESCE(NEW.raw_user_meta_data ->> 'organization', '')
  ) INTO org_exists;
  
  -- If organization doesn't exist, make user an administrator
  IF NOT org_exists THEN
    user_role := 'administrator';
  ELSE
    user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'pharmacist');
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name, email, organization, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'organization', ''),
    user_role
  );
  RETURN NEW;
END;
$$;
```

#### 6. **update_updated_at_column()**
Automatically updates the updated_at timestamp.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

#### 7. **set_organization_from_user()**
Automatically sets organization field from user's profile.

```sql
CREATE OR REPLACE FUNCTION public.set_organization_from_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.organization IS NULL OR NEW.organization = '' THEN
    SELECT profiles.organization INTO NEW.organization
    FROM public.profiles
    WHERE profiles.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;
```

---

## Authentication & Authorization

### Authentication Flow

```
1. User Registration
   ├─> Enter email, password, name, organization, role
   ├─> Supabase Auth creates user in auth.users
   ├─> Trigger: handle_new_user() fires
   ├─> Creates profile record in public.profiles
   └─> Assigns role (first user = administrator, others = specified role)

2. User Login
   ├─> Enter email and password
   ├─> Supabase Auth validates credentials
   ├─> Returns JWT token with user metadata
   ├─> Token stored in localStorage
   ├─> AuthProvider sets user context
   └─> Redirects to dashboard

3. Session Management
   ├─> JWT token auto-refreshes
   ├─> Session persisted in localStorage
   ├─> Auth state synced across tabs
   └─> Automatic logout on token expiry
```

### Authorization Model

#### Role Hierarchy
```
Administrator (Full Access)
    ↓
Manager (Most Features)
    ↓
Pharmacist (Core Features)
    ↓
Technician (Limited Features)
```

#### Role Capabilities

| Feature | Administrator | Manager | Pharmacist | Technician |
|---------|--------------|---------|------------|------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Inventory | ✅ | ✅ | ✅ | ✅ |
| Add/Edit Inventory | ✅ | ✅ | ✅ | ⚠️ Limited |
| Delete Inventory | ✅ | ✅ | ❌ | ❌ |
| Manage Medications | ✅ | ✅ | ✅ | ⚠️ Limited |
| Process Sales | ✅ | ✅ | ✅ | ✅ |
| Manage Customers | ✅ | ✅ | ✅ | ⚠️ View Only |
| View Alerts | ✅ | ✅ | ✅ | ✅ |
| Manage Alerts | ✅ | ✅ | ⚠️ Limited | ❌ |
| Send Notifications | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ⚠️ Limited | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| Role Management | ✅ | ❌ | ❌ | ❌ |

### Multi-Tenant Isolation

Each organization is completely isolated:
- All data queries filtered by organization
- RLS policies enforce organization boundaries
- Users can only see data from their organization
- Cross-organization access is impossible

---

## Security Model

### Row-Level Security (RLS) Policies

All tables have RLS enabled. Key policies include:

#### profiles Table
```sql
-- Users can view profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  get_user_organization_safe(auth.uid()) = organization
);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### medications Table
```sql
-- Users can view medications in their organization
CREATE POLICY "Users can view medications in their organization"
ON public.medications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND organization = medications.organization
  )
);

-- Users can manage medications in their organization
CREATE POLICY "Users can manage medications in their organization"
ON public.medications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND organization = medications.organization
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND organization = medications.organization
  )
);
```

#### notifications Table
```sql
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Staff can create notifications in their organization
CREATE POLICY "Staff can create notifications in their organization"
ON public.notifications FOR INSERT
WITH CHECK (
  organization IN (
    SELECT organization FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('administrator', 'manager', 'pharmacist', 'technician')
  )
);
```

#### role_change_requests Table
```sql
-- Users can view their own role change requests
CREATE POLICY "Users can view their own role change requests"
ON public.role_change_requests FOR SELECT
USING (auth.uid() = user_id);

-- Users can create role change requests
CREATE POLICY "Users can create role change requests"
ON public.role_change_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage role change requests for their organization
CREATE POLICY "Admins can manage role change requests for their organization"
ON public.role_change_requests FOR ALL
USING (
  organization IN (
    SELECT organization FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'administrator'
  )
);
```

### Security Best Practices Implemented

1. **No Client-Side Role Checks**: All authorization happens server-side via RLS
2. **Separate Role Table**: Roles stored separately from profiles to prevent privilege escalation
3. **Security Definer Functions**: Critical functions use SECURITY DEFINER to bypass RLS safely
4. **Organization Isolation**: Strict filtering prevents cross-tenant data access
5. **Input Validation**: Form validation using Zod schemas
6. **SQL Injection Prevention**: All queries use parameterized queries via Supabase client
7. **XSS Prevention**: React automatically escapes output
8. **CSRF Protection**: Supabase handles CSRF tokens

---

## Frontend Architecture

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn-ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── AddMedicationDialog.tsx
│   ├── AdminRoleRequestsManager.tsx
│   ├── AlertsManager.tsx
│   ├── AuthProvider.tsx
│   ├── CheckoutManager.tsx
│   ├── CustomerManagement.tsx
│   ├── Dashboard.tsx
│   ├── EditCustomerDialog.tsx
│   ├── InventoryList.tsx
│   ├── Layout.tsx
│   ├── MedicationDatabase.tsx
│   ├── NotificationsManager.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── useAuth.ts
├── integrations/       # External service integrations
│   └── supabase/
│       ├── client.ts   # Supabase client instance
│       └── types.ts    # Auto-generated TypeScript types
├── lib/               # Utility functions
│   └── utils.ts       # Helper functions
├── pages/             # Page components (routes)
│   ├── Auth.tsx       # Login/signup page
│   ├── Index.tsx      # Main application page
│   ├── Profile.tsx    # User profile page
│   └── NotFound.tsx   # 404 page
├── App.tsx            # Root component
├── index.css          # Global styles & design tokens
├── main.tsx           # Application entry point
└── vite-env.d.ts      # Vite type definitions
```

### Component Architecture

#### 1. **Layout Component**
Main application shell providing:
- Header with branding and user actions
- Sidebar navigation
- Real-time notification badge
- Page routing management

#### 2. **Dashboard Component**
Central hub displaying:
- Key metrics (medications, low stock, customers, sales)
- Low stock alerts with progress indicators
- Recent system alerts
- Quick action buttons

#### 3. **Module Components**

**InventoryList:**
- Display inventory with stock levels
- Color-coded stock status (critical, low, optimal, overstocked)
- Search and filter functionality
- Stock update dialogs
- Batch operations

**MedicationDatabase:**
- Comprehensive medication catalog
- Add/edit/delete medications
- Import CSV functionality
- Detailed medication information
- Barcode/NDC lookup

**CheckoutManager:**
- Point-of-sale interface
- Customer selection/creation
- Medication selection with inventory checking
- Payment processing
- Receipt generation

**CustomerManagement:**
- Customer/patient database
- Medical history tracking
- Allergy and condition management
- Order history viewing
- Insurance information

**AlertsManager:**
- System-generated alerts
- Alert severity filtering
- Mark as read functionality
- Alert type categorization
- Auto-generated expiry alerts

**NotificationsManager:**
- User-to-user messaging
- Broadcast messages
- Real-time notifications
- Read/unread status
- Staff directory

#### 4. **Authentication Components**

**AuthProvider:**
- Manages authentication state
- Provides auth context to app
- Handles session management
- Auto-refresh tokens

**Auth Page:**
- Login/signup forms
- Form validation
- Error handling
- Organization creation/joining

### State Management

#### React Query for Server State
```typescript
// Example: Fetching medications
const { data: medications, isLoading } = useQuery({
  queryKey: ['medications', organization],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  }
});
```

#### Context for Global State
```typescript
// Auth context provides user throughout app
const { user, session, loading, signIn, signOut } = useAuth();
```

#### Local State for UI
```typescript
// Component-level state for UI interactions
const [currentPage, setCurrentPage] = useState("dashboard");
const [isDialogOpen, setIsDialogOpen] = useState(false);
```

### Styling System

#### Design Tokens (index.css)
```css
:root {
  /* Color System */
  --primary: 222 47% 11%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  
  /* Semantic Colors */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84.2% 60.2%;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-variant)));
  --gradient-subtle: linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted)));
  
  /* Shadows */
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-elegant: 0 10px 30px -10px hsl(var(--primary) / 0.3);
}
```

#### Component Variants
```typescript
// Button variants using CVA
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      }
    }
  }
);
```

---

## Backend Architecture

### Supabase Configuration

**Project ID:** nzfbhrzhhntwnuopjcxz  
**Region:** us-east-1  
**Database:** PostgreSQL 15.x

### API Structure

All data access goes through Supabase's auto-generated REST API (PostgREST):

```typescript
// Example: CRUD operations

// Create
const { data, error } = await supabase
  .from('medications')
  .insert({ name: 'Aspirin', dosage: '100mg' });

// Read
const { data, error } = await supabase
  .from('medications')
  .select('*')
  .eq('organization', org);

// Update
const { data, error } = await supabase
  .from('medications')
  .update({ price: 9.99 })
  .eq('id', medicationId);

// Delete
const { data, error } = await supabase
  .from('medications')
  .delete()
  .eq('id', medicationId);
```

### Real-Time Subscriptions

```typescript
// Subscribe to inventory changes
const channel = supabase
  .channel('inventory-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'inventory',
    },
    (payload) => {
      console.log('Inventory changed:', payload);
      refetchInventory();
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### Data Access Patterns

#### 1. **Organization Scoping**
All queries automatically scoped to user's organization via RLS.

#### 2. **Joins and Relations**
```typescript
// Fetch inventory with medication details
const { data } = await supabase
  .from('inventory')
  .select(`
    *,
    medications (
      name,
      category,
      price
    )
  `);
```

#### 3. **Aggregations**
```typescript
// Count medications by category
const { count } = await supabase
  .from('medications')
  .select('*', { count: 'exact', head: true })
  .eq('category', 'Antibiotics');
```

#### 4. **Full-Text Search**
```typescript
// Search medications by name
const { data } = await supabase
  .from('medications')
  .select('*')
  .textSearch('name', searchTerm);
```

---

## Features & Modules

### 1. Dashboard
**Purpose:** Central hub for monitoring pharmacy operations

**Features:**
- Real-time metrics (total medications, low stock items, customers, sales)
- Low stock alerts with visual indicators
- Recent system alerts feed
- Quick action shortcuts
- Auto-refresh capability

### 2. Checkout/Point of Sale
**Purpose:** Process over-the-counter and prescription sales

**Features:**
- Customer lookup/creation
- Medication selection with search
- Real-time inventory checking
- Quantity adjustment
- Running total calculation
- Multiple payment methods (cash, card, insurance)
- Sale notes and special instructions
- Inventory auto-deduction on completion

**Workflow:**
```
Select Customer → Add Items → Verify Inventory → 
Process Payment → Complete Sale → Update Inventory
```

### 3. Inventory Management
**Purpose:** Track and manage medication stock levels

**Features:**
- Comprehensive inventory listing
- Stock level indicators (color-coded)
- Low stock warnings
- Update stock dialog
- Batch stock updates
- Location tracking
- Supplier information
- Last restocked date
- Reorder threshold management

**Stock Status Logic:**
- Critical: stock ≤ 25% of minimum
- Low: stock ≤ minimum
- Optimal: minimum < stock ≤ maximum
- Overstocked: stock > maximum

### 4. Medication Database
**Purpose:** Master catalog of all medications

**Features:**
- Add/edit/delete medications
- Comprehensive medication details:
  - Generic and brand names
  - NDC numbers
  - Dosage and form
  - Category classification
  - Manufacturer information
  - Pricing (cost and retail)
  - Expiration dates
  - Barcode/lot numbers
- CSV import functionality
- Search and filter
- View detailed information

### 5. Customer/Patient Management
**Purpose:** Maintain customer records and medical history

**Features:**
- Customer profile creation
- Personal information
- Medical conditions tracking
- Allergy management
- Insurance information
- Order history viewing
- Prescription tracking
- Contact information

### 6. Alerts System
**Purpose:** Automated system notifications

**Alert Types:**
- Expiring medications
- Low stock warnings
- Out of stock alerts
- Reorder suggestions
- Order status updates

**Features:**
- Severity classification (critical, high, medium, low)
- Read/unread status
- Alert filtering by type/severity
- Automatic alert generation
- Alert history

### 7. Notifications System
**Purpose:** Internal staff communication

**Features:**
- User-to-user messages
- Broadcast messages to all staff
- Read/unread tracking
- Real-time delivery
- Notification badge on header
- Staff directory for messaging
- Message history

### 8. Order Management
**Purpose:** Handle prescription orders

**Features:**
- Create prescription orders
- Link to customers
- Order status tracking (pending, processing, ready, completed)
- Insurance processing
- Doctor information
- Order items management
- Total and copay calculation

### 9. User Profile
**Purpose:** Manage user account and settings

**Features:**
- View profile information
- Update personal details
- Request role changes
- View organization information
- Sign out

### 10. Role Management (Admin Only)
**Purpose:** Manage user roles and permissions

**Features:**
- View role change requests
- Approve/reject requests
- Provide feedback to users
- Track request history
- Organization-wide user overview

---

## API Integration

### Supabase Client Configuration

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nzfbhrzhhntwnuopjcxz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Type Safety

TypeScript types are auto-generated from the database schema:

```typescript
// Example type usage
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Medication = Tables<'medications'>;
type NewMedication = TablesInsert<'medications'>;
type MedicationUpdate = TablesUpdate<'medications'>;
```

### Error Handling

```typescript
try {
  const { data, error } = await supabase
    .from('medications')
    .select('*');
    
  if (error) throw error;
  
  // Process data
} catch (error: any) {
  toast({
    title: 'Error loading medications',
    description: error.message,
    variant: 'destructive',
  });
}
```

---

## Mobile & Native Features

### Capacitor Integration

The application includes native mobile capabilities through **Capacitor**, enabling deployment as native iOS and Android applications while maintaining a single codebase.

#### Configuration
```typescript
// capacitor.config.ts
{
  appId: 'app.lovable.388177bfde6e424d9006e0f8ce7e9950',
  appName: 'pill-guardian-plus',
  webDir: 'dist',
  server: {
    url: 'https://388177bf-de6e-424d-9006-e0f8ce7e9950.lovableproject.com',
    cleartext: true  // For development hot-reload
  },
  plugins: {
    BarcodeScanner: {
      // Camera permission configuration
    }
  }
}
```

### Barcode Scanning Feature

**Plugin:** `@capacitor-mlkit/barcode-scanning`  
**Purpose:** Enable camera-based barcode scanning for rapid medication lookup and checkout

#### Implementation

**Custom Hook:** `useBarcodeScanner`
```typescript
// src/hooks/useBarcodeScanner.ts
export const useBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);

  const startScan = async (onBarcodeDetected: (barcode: string) => void) => {
    // Check device support
    const { supported } = await BarcodeScanner.isSupported();
    
    // Request camera permissions
    const { camera } = await BarcodeScanner.requestPermissions();
    
    // Start scanning
    const result = await BarcodeScanner.scan();
    if (result.barcodes?.length > 0) {
      onBarcodeDetected(result.barcodes[0].rawValue);
    }
  };

  return { isScanning, startScan, stopScan };
};
```

#### Features
- **Real-time camera scanning:** Uses device camera for barcode detection
- **Permission management:** Automatic camera permission requests
- **Device support detection:** Checks if barcode scanning is available
- **Medication lookup:** Automatically searches medications by barcode
- **Cart integration:** Adds scanned medications directly to checkout cart
- **Stock verification:** Shows current stock levels for scanned items
- **Toast notifications:** User feedback for scan success/failure

#### Usage in Components
```typescript
// CheckoutManager.tsx
const { isScanning, startScan } = useBarcodeScanner();

const handleCameraScan = async () => {
  await startScan((barcode) => {
    // Find medication by barcode
    const medication = medications.find(m => m.barcode === barcode);
    if (medication) {
      addToCart(medication);
      toast.success('Medication added to cart');
    }
  });
};
```

#### UI Integration
- **Camera button** in checkout interface
- **Scan icon** for visual clarity
- **Loading state** during active scanning
- **Responsive design** for mobile devices

### Mobile Deployment Process

1. **Setup Development Environment**
   ```bash
   # Export project to GitHub
   git clone <repository-url>
   cd pill-guardian-plus
   npm install
   ```

2. **Initialize Native Platforms**
   ```bash
   # Add iOS platform (requires macOS + Xcode)
   npx cap add ios
   
   # Add Android platform (requires Android Studio)
   npx cap add android
   ```

3. **Update Dependencies**
   ```bash
   # Update native platform dependencies
   npx cap update ios
   npx cap update android
   ```

4. **Build & Sync**
   ```bash
   # Build web assets
   npm run build
   
   # Sync with native platforms
   npx cap sync
   ```

5. **Run on Device/Emulator**
   ```bash
   # iOS (requires Mac + Xcode)
   npx cap run ios
   
   # Android (requires Android Studio)
   npx cap run android
   ```

#### Platform Requirements
- **iOS:** macOS with Xcode installed
- **Android:** Android Studio with SDK tools
- **Camera permissions:** Configured in native platform files
- **Hot reload:** Enabled via server URL in config

### Native Capabilities Available
- ✅ Camera access for barcode scanning
- ✅ Device storage
- ✅ Network detection
- ✅ Push notifications (can be added)
- ✅ Geolocation (can be added)
- ✅ File system access (can be added)

---

## Deployment

### Azure App Service Configuration

**Deployment Platform:** Microsoft Azure  
**App Service:** jpjga-pharmacare

#### Deployment Workflow
```yaml
# .github/workflows/main_jpjga-pharmacare.yml
name: Build and deploy Node.js app to Azure Web App

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js version
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'
      
      - name: npm install and build
        run: |
          npm install
          npm run build --if-present
      
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: dist/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: node-app
      
      - name: 'Deploy to Azure Web App'
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'jpjga-pharmacare'
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}
```

#### Web Configuration
```xml
<!-- public/web.config -->
<?xml version="1.0"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### Environment Variables

Required environment variables (set in build environment):
```
# None required - Supabase credentials hardcoded in client.ts
# (Consider moving to environment variables for production)
```

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### SEO Configuration

```html
<!-- index.html -->
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="PharmaCare - Comprehensive Pharmacy Inventory Management System" />
  <title>PharmaCare - Pharmacy Management</title>
  
  <!-- Open Graph -->
  <meta property="og:title" content="PharmaCare" />
  <meta property="og:description" content="Modern pharmacy inventory management" />
  <meta property="og:image" content="/social-preview.png" />
  
  <!-- Robots -->
  <link rel="robots" href="/robots.txt" />
</head>
```

---

## Development Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager
- Git
- Modern web browser

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd pharmacare

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:8080
```

### Available Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

### Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement changes
   - Test locally
   - Commit with descriptive messages

2. **Database Changes**
   - Create migration SQL
   - Test in local Supabase
   - Apply to staging
   - Apply to production

3. **Testing**
   - Manual UI testing
   - Cross-browser testing
   - Mobile responsiveness
   - RLS policy verification

4. **Deployment**
   - Push to main branch
   - GitHub Actions builds
   - Deploys to Azure
   - Verify production

### Best Practices

1. **Code Organization**
   - Keep components focused and small
   - Extract reusable logic to hooks
   - Use TypeScript for type safety
   - Follow naming conventions

2. **State Management**
   - Use React Query for server state
   - Context for global UI state
   - Local state for component-specific UI

3. **Performance**
   - Lazy load large components
   - Memoize expensive calculations
   - Optimize re-renders
   - Use proper indexes in queries

4. **Security**
   - Never check role on client side only
   - Always rely on RLS policies
   - Validate all inputs
   - Use prepared statements

---

## Technical Debt & Future Improvements

### Known Issues
1. Supabase credentials hardcoded in client.ts (should use environment variables)
2. Limited error boundary implementation
3. No automated testing suite
4. Manual CSV import validation

### Planned Features
1. **Reporting Module**
   - Sales reports by period
   - Inventory turnover analytics
   - Customer purchase patterns
   - Financial summaries

2. **Advanced Search**
   - Full-text search across all modules
   - Advanced filtering options
   - Saved search preferences

3. **Barcode Scanning**
   - Mobile barcode scanner integration
   - Quick medication lookup
   - Fast checkout process

4. **Email Notifications**
   - Low stock email alerts
   - Order status updates
   - Customer communication

5. **Mobile App**
   - React Native mobile version
   - Offline capability
   - Push notifications

6. **Integration APIs**
   - Third-party pharmacy systems
   - Insurance verification APIs
   - Drug interaction databases

### Performance Optimizations
- Implement virtual scrolling for large lists
- Add pagination to all data tables
- Optimize database indexes
- Implement caching strategies
- Add service worker for offline support

---

## Monitoring & Maintenance

### Logging
- Client-side errors logged to console
- Supabase logs available in dashboard
- GitHub Actions deployment logs

### Backup Strategy
- Supabase automatic daily backups
- Point-in-time recovery available
- Manual backup before major changes

### Updates & Patches
- Regular dependency updates
- Security patch monitoring
- Database migration versioning

---

## Support & Documentation

### Internal Documentation
- This development report
- Inline code comments
- Component prop documentation

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn-ui Documentation](https://ui.shadcn.com)

### Contact Information
- Development Team: [Team contact]
- Technical Support: [Support contact]
- Emergency Contact: [Emergency contact]

---

## Appendix

### Technology Versions
```json
{
  "react": "18.3.1",
  "typescript": "5.x",
  "vite": "5.x",
  "@supabase/supabase-js": "2.57.4",
  "@tanstack/react-query": "5.83.0",
  "tailwindcss": "3.x",
  "react-router-dom": "6.30.1"
}
```

### Database Size Estimates
- profiles: ~100 rows per organization
- medications: ~1,000-10,000 rows
- inventory: ~1,000-10,000 rows
- customers: ~1,000-50,000 rows
- orders: ~10,000-500,000 rows
- sales: ~10,000-500,000 rows
- notifications: ~1,000-50,000 rows
- alerts: ~1,000-10,000 rows

### Glossary
- **RLS**: Row-Level Security
- **JWT**: JSON Web Token
- **CRUD**: Create, Read, Update, Delete
- **NDC**: National Drug Code
- **POS**: Point of Sale
- **UI**: User Interface
- **API**: Application Programming Interface

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-05  
**Author:** Development Team  
**Status:** Active Development

---

*This document is a living document and should be updated as the application evolves.*
