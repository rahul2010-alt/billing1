# M R Medical Store Billing Application

A comprehensive medical store billing and inventory management system built with React, TypeScript, and Supabase.

## Table of Contents
- [Overview](#overview)
- [Supabase Setup Guide](#supabase-setup-guide)
- [Database Schema](#database-schema)
- [Environment Configuration](#environment-configuration)
- [Features](#features)
- [Installation](#installation)
- [Migration Guide](#migration-guide)

## Overview

This application provides a complete solution for medical store management including:
- Customer and supplier management
- Product inventory tracking
- Invoice generation and billing
- Purchase order management
- GST reporting and compliance
- User management and authentication
- Database backup and restore

## Supabase Setup Guide

### 1. Create New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `mr-medical-store` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

### 2. Get Project Credentials

After project creation, go to **Settings > API**:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret)

### 3. Configure Authentication

Go to **Authentication > Settings**:

#### Email Settings
- **Enable email confirmations**: `Disabled` (for demo purposes)
- **Enable email change confirmations**: `Disabled`
- **Enable secure email change**: `Enabled`

#### Security Settings
- **Site URL**: `http://localhost:5173` (for development)
- **Redirect URLs**: Add your production domain when deploying

#### Auth Providers
- **Email**: `Enabled` (default)
- Disable other providers unless needed

### 4. Database Setup

The application uses the following migration files that need to be applied in order:

#### Core Schema (20250604131322_calm_lodge.sql)
Creates the main tables:
- `customers` - Customer information with GST details
- `products` - Product catalog with inventory tracking
- `invoices` - Sales invoices
- `invoice_items` - Invoice line items
- `suppliers` - Supplier information
- `purchases` - Purchase orders
- `purchase_items` - Purchase line items

#### Database Functions (20250604131653_raspy_fire.sql)
Creates essential functions:
- `update_product_stock()` - Updates product inventory
- `generate_invoice_number()` - Auto-generates invoice numbers
- `generate_purchase_number()` - Auto-generates purchase numbers
- Triggers for automatic stock updates and number generation

#### Utility Functions (20250604135507_scarlet_wind.sql)
- `get_low_stock_items()` - Returns products below reorder level

#### Schema Fixes (20250604142831_aged_ocean.sql)
- Adds `batch_number` column to products table

#### Backup System (20250604145306_still_resonance.sql)
- Creates `backups` table for database backup management

#### User Management (20250604145604_spring_dream.sql)
- Creates `users` table linked to auth.users
- Sets up user roles and permissions

#### Data Initialization (20250604151256_misty_gate.sql & 20250604151413_curly_boat.sql)
- Imports initial users from auth.users
- Sets up admin user

#### Schema Corrections (20250604154632_holy_limit.sql & 20250604154734_odd_hall.sql)
- Fixes state_code column issues in customers table

#### Row Level Security (Multiple files from 20250606)
- Comprehensive RLS policies for all tables
- Ensures proper data access control
- Fixes authentication and authorization issues

### 5. Apply Migrations

You have two options to set up the database:

#### Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Apply all migrations
supabase db push
```

#### Option B: Manual SQL Execution
1. Go to **SQL Editor** in Supabase Dashboard
2. Execute each migration file in chronological order:
   - Copy content from each `.sql` file in `supabase/migrations/`
   - Paste and run in SQL Editor
   - Ensure each migration completes successfully before proceeding

### 6. Create Demo User

Execute this SQL to create a demo admin user:

```sql
-- Create demo admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@mrmedical.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

## Database Schema

### Core Tables

#### customers
- Customer information for B2B, B2C, and B2CL transactions
- Includes GST details and state information
- Supports different customer types for GST compliance

#### products
- Complete product catalog with HSN codes
- Inventory tracking with stock levels and reorder points
- Batch number and expiry date management
- Purchase and selling price tracking

#### invoices & invoice_items
- Sales invoice management
- Line-item details with GST calculations
- Payment tracking and status management
- Automatic invoice number generation

#### purchases & purchase_items
- Purchase order management
- Supplier invoice tracking
- Stock update automation
- GST input credit tracking

#### suppliers
- Supplier information with GST details
- Contact and address management
- State-wise supplier categorization

#### users
- User management linked to Supabase auth
- Role-based access control (admin, manager, staff)
- Activity tracking and session management

#### backups
- Database backup management
- Backup history and status tracking
- Download URL management

### Key Features

#### Automatic Stock Management
- Stock automatically decreases on invoice creation
- Stock automatically increases on purchase entry
- Low stock alerts and reporting

#### GST Compliance
- Automatic GST calculations based on customer state
- CGST/SGST for intra-state transactions
- IGST for inter-state transactions
- HSN code management

#### Invoice Management
- Automatic invoice number generation
- Multiple payment modes (cash, card, UPI, credit)
- Payment status tracking
- Print-ready invoice format

#### User Authentication
- Secure login with email/password
- Role-based permissions
- Session management
- Password change functionality

## Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase project credentials.

## Features

### 🏪 Store Management
- Business information setup
- Multi-location support
- Tax configuration

### 👥 Customer Management
- B2B, B2C, and B2CL customer types
- GST number validation
- Customer history tracking

### 📦 Inventory Management
- Product catalog with HSN codes
- Batch and expiry tracking
- Low stock alerts
- Automatic reorder suggestions

### 🧾 Billing & Invoicing
- GST-compliant invoice generation
- Multiple payment modes
- Print-ready formats
- Payment tracking

### 📊 Reporting
- Sales and purchase reports
- GST reports (B2B, B2CL, B2CS, HSN)
- Inventory reports
- Financial summaries

### 🔐 User Management
- Role-based access control
- User activity tracking
- Secure authentication

### 💾 Backup & Restore
- Automated database backups
- Manual backup creation
- Restore functionality

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mr-medical-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173
   - Login with: admin@mrmedical.com / admin123

## Migration Guide

### Moving to a New Supabase Account

1. **Export Current Data** (if needed)
   ```bash
   # Using Supabase CLI
   supabase db dump --data-only > data-backup.sql
   ```

2. **Create New Supabase Project**
   - Follow the setup guide above
   - Note down new project credentials

3. **Update Environment Variables**
   ```env
   VITE_SUPABASE_URL=https://new-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=new-anon-key-here
   ```

4. **Apply Database Schema**
   ```bash
   # Link to new project
   supabase link --project-ref new-project-id
   
   # Apply migrations
   supabase db push
   ```

5. **Import Data** (if needed)
   ```bash
   # Import data backup
   supabase db reset --linked
   psql -h db.new-project-id.supabase.co -U postgres -d postgres < data-backup.sql
   ```

6. **Test Application**
   - Verify all features work correctly
   - Test authentication and data access
   - Confirm real-time updates function

### Production Deployment

1. **Update Site URL** in Supabase Auth settings
2. **Add production domain** to redirect URLs
3. **Update environment variables** for production
4. **Enable email confirmations** if required
5. **Set up custom SMTP** for email notifications

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Ensure all migration files are applied
   - Check user authentication status
   - Verify RLS policies are correctly set

2. **Real-time Updates Not Working**
   - Check Supabase connection
   - Verify real-time subscriptions are enabled
   - Ensure proper table permissions

3. **Authentication Issues**
   - Verify email confirmation settings
   - Check site URL configuration
   - Ensure user exists in both auth.users and public.users

4. **Print Functionality Issues**
   - Check browser print permissions
   - Verify print settings configuration
   - Ensure invoice data is properly loaded

### Support

For technical support or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check application logs for specific errors
4. Verify database schema and migrations

---

**Note**: This application is designed for medical store management and includes GST compliance features specific to Indian taxation. Modify as needed for other regions or tax systems.