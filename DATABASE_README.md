# Database Setup Guide

This document provides step-by-step instructions to set up the database and configure required APIs for the apartment rental platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Tables Overview](#database-tables-overview)
3. [Step-by-Step Database Setup](#step-by-step-database-setup)
4. [Required APIs and Secrets](#required-apis-and-secrets)
5. [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)

---

## Prerequisites

- A Lovable Cloud project (automatically includes Supabase backend)
- Access to run database migrations through Lovable

---

## Database Tables Overview

| Table | Purpose |
|-------|---------|
| `profiles` | Stores user profile information (name, email, phone, avatar) |
| `user_roles` | Manages user roles (admin, user) for access control |
| `apartments` | Stores apartment listings with details, pricing, and location |
| `apartment_images` | Stores additional images for apartments |
| `bookings` | Manages booking requests between users and apartments |

---

## Step-by-Step Database Setup

### Step 1: Create the App Role Enum

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

### Step 2: Create the Apartment Status Enum

```sql
CREATE TYPE public.apartment_status AS ENUM ('active', 'inactive');
```

### Step 3: Create the Booking Status Enum

```sql
CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'declined');
```

### Step 4: Create the Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Step 5: Create the User Roles Table

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### Step 6: Create the Has Role Function (Security Definer)

This function prevents infinite recursion in RLS policies:

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### Step 7: Create the Apartments Table

```sql
CREATE TABLE public.apartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location_text TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  price_per_day NUMERIC NOT NULL,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  image_main_url TEXT,
  status apartment_status DEFAULT 'active',
  amenities TEXT[],
  region TEXT DEFAULT 'kenya',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
```

### Step 8: Create the Apartment Images Table

```sql
CREATE TABLE public.apartment_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.apartment_images ENABLE ROW LEVEL SECURITY;
```

### Step 9: Create the Bookings Table

```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  total_price NUMERIC,
  status booking_status DEFAULT 'pending',
  admin_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
```

### Step 10: Create the Handle New User Trigger

This automatically creates a profile and assigns the 'user' role when someone signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Required APIs and Secrets

### 1. LOVABLE_API_KEY (Required for AI Chat)

**Purpose:** Powers the AI chat assistant feature using Lovable AI.

**How to set up:**
1. This is automatically configured when using Lovable Cloud
2. The AI chat feature uses the `google/gemini-2.5-flash` model
3. No additional API key setup required from the user

### 2. Supabase Keys (Auto-configured)

These are automatically set up by Lovable Cloud:

| Secret | Purpose |
|--------|---------|
| `SUPABASE_URL` | Database connection URL |
| `SUPABASE_ANON_KEY` | Public anonymous key for client-side access |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for server-side operations |
| `SUPABASE_DB_URL` | Direct database connection string |
| `SUPABASE_PUBLISHABLE_KEY` | Public key for client apps |

### 3. Optional: Mapbox API (For Maps)

If you want to use map features:

1. Create a Mapbox account at [mapbox.com](https://www.mapbox.com/)
2. Get your public access token
3. Add it as a secret named `MAPBOX_ACCESS_TOKEN`

---

## Row-Level Security (RLS) Policies

### Profiles Table Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### User Roles Table Policies

```sql
-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Admins can insert roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update roles
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Admins can delete roles
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
```

### Apartments Table Policies

```sql
-- Anyone can view active apartments
CREATE POLICY "Anyone can view active apartments" ON public.apartments
  FOR SELECT USING (status = 'active' OR has_role(auth.uid(), 'admin'));

-- Admins can manage apartments
CREATE POLICY "Admins can manage apartments" ON public.apartments
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### Apartment Images Table Policies

```sql
-- Anyone can view apartment images
CREATE POLICY "Anyone can view apartment images" ON public.apartment_images
  FOR SELECT USING (true);

-- Admins can manage apartment images
CREATE POLICY "Admins can manage apartment images" ON public.apartment_images
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### Bookings Table Policies

```sql
-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending bookings
CREATE POLICY "Users can update their own pending bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

---

## Creating an Admin User

To make a user an admin, insert their role into the `user_roles` table:

```sql
-- Replace 'USER_UUID_HERE' with the actual user's UUID from auth.users
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_HERE', 'admin');
```

---

## Edge Functions

### Chat Function (`supabase/functions/chat/index.ts`)

**Purpose:** AI-powered chat assistant for apartment inquiries

**Configuration in `supabase/config.toml`:**
```toml
[functions.chat]
verify_jwt = false
```

**Required Secrets:**
- `LOVABLE_API_KEY` (auto-configured)

---

## Environment Variables

These are automatically available in your frontend code:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

---

## Quick Start Checklist

- [ ] All database tables created
- [ ] All enums created (app_role, apartment_status, booking_status)
- [ ] has_role function created
- [ ] handle_new_user trigger created
- [ ] RLS policies applied to all tables
- [ ] AI chat edge function deployed
- [ ] (Optional) Mapbox API key added for maps

---

## Support

For issues with database setup, check:
1. Lovable Cloud dashboard for migration status
2. Console logs for RLS policy errors
3. Edge function logs for API issues
