# Database Documentation

This document explains all the database tables, enums, functions, and configurations used in this apartment rental platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Enums](#enums)
3. [Tables](#tables)
4. [Functions](#functions)
5. [Triggers](#triggers)
6. [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
7. [API Keys & Secrets](#api-keys--secrets)
8. [Step-by-Step Setup Guide](#step-by-step-setup-guide)

---

## Overview

This project uses **Lovable Cloud** (powered by Supabase) for the backend infrastructure, including:

- **PostgreSQL Database** - For storing all application data
- **Authentication** - Built-in user authentication system
- **Row-Level Security** - Database-level access control
- **Edge Functions** - Serverless functions for AI chat

---

## Enums

### 1. `app_role`
Defines user roles in the application.

| Value | Description |
|-------|-------------|
| `admin` | Administrator with full access |
| `user` | Regular user with limited access |

### 2. `apartment_status`
Defines the visibility status of apartments.

| Value | Description |
|-------|-------------|
| `active` | Apartment is visible to users |
| `inactive` | Apartment is hidden from users |

### 3. `booking_status`
Defines the status of a booking request.

| Value | Description |
|-------|-------------|
| `pending` | Booking awaiting admin approval |
| `approved` | Booking has been approved |
| `declined` | Booking has been declined |

---

## Tables

### 1. `profiles`

Stores user profile information. Created automatically when a user signs up.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | - | Primary key, references auth.users |
| `email` | text | Yes | - | User's email address |
| `name` | text | Yes | - | User's display name |
| `phone` | text | Yes | - | User's phone number |
| `avatar_url` | text | Yes | - | URL to user's avatar image |
| `created_at` | timestamptz | Yes | now() | When the profile was created |

### 2. `user_roles`

Stores user role assignments. Each user can have multiple roles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References the user |
| `role` | app_role | No | 'user' | The role assigned |

**Important:** Roles are stored in a separate table for security. Never store roles in the profiles table to prevent privilege escalation attacks.

### 3. `apartments`

Stores apartment listings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `name` | text | No | - | Apartment name |
| `description` | text | Yes | - | Detailed description |
| `price_per_day` | numeric | No | - | Daily rental price |
| `bedrooms` | integer | Yes | 1 | Number of bedrooms |
| `bathrooms` | integer | Yes | 1 | Number of bathrooms |
| `location_text` | text | Yes | - | Human-readable address |
| `region` | text | Yes | 'kenya' | Region (kenya/usa) |
| `latitude` | double precision | Yes | - | GPS latitude |
| `longitude` | double precision | Yes | - | GPS longitude |
| `image_main_url` | text | Yes | - | Main listing image URL |
| `amenities` | text[] | Yes | - | Array of amenities |
| `status` | apartment_status | Yes | 'active' | Visibility status |
| `created_at` | timestamptz | Yes | now() | Creation timestamp |

### 4. `apartment_images`

Stores additional images for apartments.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `apartment_id` | uuid | No | - | References apartments table |
| `image_url` | text | No | - | Image URL |
| `created_at` | timestamptz | Yes | now() | Creation timestamp |

### 5. `bookings`

Stores booking requests from users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | User who made the booking |
| `apartment_id` | uuid | No | - | Apartment being booked |
| `date_start` | date | No | - | Check-in date |
| `date_end` | date | No | - | Check-out date |
| `total_price` | numeric | Yes | - | Calculated total price |
| `status` | booking_status | Yes | 'pending' | Booking status |
| `admin_message` | text | Yes | - | Message from admin |
| `created_at` | timestamptz | Yes | now() | Creation timestamp |

---

## Functions

### `has_role(_user_id uuid, _role app_role)`

Checks if a user has a specific role. Used in RLS policies.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

**Note:** Uses `SECURITY DEFINER` to bypass RLS and prevent recursive policy checks.

### `handle_new_user()`

Trigger function that creates a profile and assigns the 'user' role when someone signs up.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;
```

---

## Triggers

### `on_auth_user_created`

Executes `handle_new_user()` when a new user signs up.

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Row-Level Security (RLS) Policies

### Profiles Table

| Policy | Command | Rule |
|--------|---------|------|
| Users can view their own profile | SELECT | `auth.uid() = id` |
| Users can insert their own profile | INSERT | `auth.uid() = id` |
| Users can update their own profile | UPDATE | `auth.uid() = id` |

### User Roles Table

| Policy | Command | Rule |
|--------|---------|------|
| Users can view their own roles | SELECT | `auth.uid() = user_id` |
| Admins can view all roles | SELECT | `has_role(auth.uid(), 'admin')` |
| Admins can insert roles | INSERT | `has_role(auth.uid(), 'admin')` |
| Admins can update roles | UPDATE | `has_role(auth.uid(), 'admin')` |
| Admins can delete roles | DELETE | `has_role(auth.uid(), 'admin')` |

### Apartments Table

| Policy | Command | Rule |
|--------|---------|------|
| Anyone can view active apartments | SELECT | `status = 'active' OR has_role(auth.uid(), 'admin')` |
| Admins can manage apartments | ALL | `has_role(auth.uid(), 'admin')` |

### Apartment Images Table

| Policy | Command | Rule |
|--------|---------|------|
| Anyone can view apartment images | SELECT | `true` |
| Admins can manage apartment images | ALL | `has_role(auth.uid(), 'admin')` |

### Bookings Table

| Policy | Command | Rule |
|--------|---------|------|
| Users can view their own bookings | SELECT | `auth.uid() = user_id OR has_role(auth.uid(), 'admin')` |
| Users can create bookings | INSERT | `auth.uid() = user_id` |
| Users can update their pending bookings | UPDATE | `auth.uid() = user_id AND status = 'pending'` |
| Admins can manage all bookings | ALL | `has_role(auth.uid(), 'admin')` |

---

## API Keys & Secrets

### Required Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `SUPABASE_URL` | Database URL (auto-configured) | Yes |
| `SUPABASE_ANON_KEY` | Public API key (auto-configured) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API key (auto-configured) | Yes |
| `LOVABLE_API_KEY` | For AI chat functionality | Yes |

### Optional Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `MAPBOX_ACCESS_TOKEN` | For map integration | No |

---

## Step-by-Step Setup Guide

### Step 1: Create Enums

```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create apartment status enum
CREATE TYPE public.apartment_status AS ENUM ('active', 'inactive');

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'declined');
```

### Step 2: Create Tables

```sql
-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- 3. Create apartments table
CREATE TABLE public.apartments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_per_day NUMERIC NOT NULL,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  location_text TEXT,
  region TEXT DEFAULT 'kenya',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_main_url TEXT,
  amenities TEXT[],
  status apartment_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create apartment_images table
CREATE TABLE public.apartment_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  total_price NUMERIC,
  status booking_status DEFAULT 'pending',
  admin_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Step 3: Create Functions

```sql
-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 4: Enable Row-Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
```

### Step 5: Create RLS Policies

See the [RLS Policies section](#row-level-security-rls-policies) above for all policy definitions.

### Step 6: Create an Admin User

After a user signs up, promote them to admin:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

---

## Edge Functions

### Chat Function (`supabase/functions/chat/index.ts`)

Handles AI-powered chat using Lovable AI. Requires `LOVABLE_API_KEY` secret.

**Endpoint:** `POST /functions/v1/chat`

**Request Body:**
```json
{
  "message": "Your question here"
}
```

**Response:**
```json
{
  "response": "AI response here"
}
```

---

## Frontend Environment Variables

Available in the frontend via `import.meta.env`:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key |
| `VITE_SUPABASE_PROJECT_ID` | Project ID |

---

## Data Flow Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Signs Up │────▶│  auth.users      │────▶│ Trigger:        │
│                 │     │  (Supabase Auth) │     │ on_auth_user_   │
└─────────────────┘     └──────────────────┘     │ created         │
                                                  └────────┬────────┘
                                                           │
                        ┌──────────────────────────────────┼──────────────────────┐
                        │                                  │                      │
                        ▼                                  ▼                      │
              ┌─────────────────┐              ┌─────────────────┐               │
              │   profiles      │              │   user_roles    │               │
              │   (id, email,   │              │   (user_id,     │               │
              │    name, etc.)  │              │    role='user') │               │
              └─────────────────┘              └─────────────────┘               │
                                                                                  │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐              │
│   apartments    │◀───▶│ apartment_images│     │    bookings     │◀─────────────┘
│   (listings)    │     │ (gallery)       │     │ (user requests) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Security Best Practices

1. **Never store roles in the profiles table** - Use the separate `user_roles` table
2. **Always use RLS policies** - Protect data at the database level
3. **Use `SECURITY DEFINER` carefully** - Only for functions that need elevated privileges
4. **Validate on the server** - Never trust client-side role checks
5. **Keep secrets secure** - Never expose service role keys to the frontend

---

## Support

For questions or issues:
- Check the [Lovable Documentation](https://docs.lovable.dev/)
- Join the [Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
