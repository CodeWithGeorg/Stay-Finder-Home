-- -- Create enum for user roles
-- CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- -- Create enum for booking status
-- CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'declined');

-- -- Create enum for apartment status
-- CREATE TYPE public.apartment_status AS ENUM ('active', 'inactive');

-- -- Create profiles table
-- CREATE TABLE public.profiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   name TEXT,
--   email TEXT,
--   phone TEXT,
--   avatar_url TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- -- Create user_roles table
-- CREATE TABLE public.user_roles (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
--   role app_role NOT NULL DEFAULT 'user',
--   UNIQUE (user_id, role)
-- );

-- -- Create apartments table
-- CREATE TABLE public.apartments (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT NOT NULL,
--   description TEXT,
--   location_text TEXT,
--   latitude DOUBLE PRECISION,
--   longitude DOUBLE PRECISION,
--   price_per_day DECIMAL(10,2) NOT NULL,
--   bedrooms INTEGER DEFAULT 1,
--   bathrooms INTEGER DEFAULT 1,
--   image_main_url TEXT,
--   status apartment_status DEFAULT 'active',
--   amenities TEXT[],
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- -- Create apartment_images table
-- CREATE TABLE public.apartment_images (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE NOT NULL,
--   image_url TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- -- Create bookings table
-- CREATE TABLE public.bookings (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
--   apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE NOT NULL,
--   date_start DATE NOT NULL,
--   date_end DATE NOT NULL,
--   total_price DECIMAL(10,2),
--   status booking_status DEFAULT 'pending',
--   admin_message TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- -- Enable RLS on all tables
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.apartment_images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- -- Create security definer function to check roles
-- CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
-- RETURNS BOOLEAN
-- LANGUAGE SQL
-- STABLE
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
--   SELECT EXISTS (
--     SELECT 1
--     FROM public.user_roles
--     WHERE user_id = _user_id
--       AND role = _role
--   )
-- $$;

-- -- Profiles policies
-- CREATE POLICY "Users can view their own profile"
-- ON public.profiles FOR SELECT
-- USING (auth.uid() = id);

-- CREATE POLICY "Users can update their own profile"
-- ON public.profiles FOR UPDATE
-- USING (auth.uid() = id);

-- CREATE POLICY "Users can insert their own profile"
-- ON public.profiles FOR INSERT
-- WITH CHECK (auth.uid() = id);

-- -- User roles policies
-- CREATE POLICY "Users can view their own roles"
-- ON public.user_roles FOR SELECT
-- USING (auth.uid() = user_id);

-- CREATE POLICY "Admins can manage all roles"
-- ON public.user_roles FOR ALL
-- USING (public.has_role(auth.uid(), 'admin'));

-- -- Apartments policies (public read, admin write)
-- CREATE POLICY "Anyone can view active apartments"
-- ON public.apartments FOR SELECT
-- USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

-- CREATE POLICY "Admins can manage apartments"
-- ON public.apartments FOR ALL
-- USING (public.has_role(auth.uid(), 'admin'));

-- -- Apartment images policies
-- CREATE POLICY "Anyone can view apartment images"
-- ON public.apartment_images FOR SELECT
-- USING (true);

-- CREATE POLICY "Admins can manage apartment images"
-- ON public.apartment_images FOR ALL
-- USING (public.has_role(auth.uid(), 'admin'));

-- -- Bookings policies
-- CREATE POLICY "Users can view their own bookings"
-- ON public.bookings FOR SELECT
-- USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- CREATE POLICY "Users can create bookings"
-- ON public.bookings FOR INSERT
-- WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own pending bookings"
-- ON public.bookings FOR UPDATE
-- USING (auth.uid() = user_id AND status = 'pending');

-- CREATE POLICY "Admins can manage all bookings"
-- ON public.bookings FOR ALL
-- USING (public.has_role(auth.uid(), 'admin'));

-- -- Create function to handle new user signup
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER SET search_path = public
-- AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, name)
--   VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'name');
  
--   INSERT INTO public.user_roles (user_id, role)
--   VALUES (NEW.id, 'user');
  
--   RETURN NEW;
-- END;
-- $$;

-- -- Create trigger for new user signup
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -- Insert sample apartments
-- INSERT INTO public.apartments (name, description, location_text, latitude, longitude, price_per_day, bedrooms, bathrooms, image_main_url, status, amenities) VALUES
-- ('Sunset Beach Villa', 'Luxurious beachfront villa with stunning ocean views. Perfect for a romantic getaway or family vacation.', 'Miami Beach, FL', 25.7617, -80.1918, 350.00, 3, 2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'active', ARRAY['WiFi', 'Pool', 'Beach Access', 'Air Conditioning', 'Kitchen']),
-- ('Downtown Loft', 'Modern loft in the heart of the city. Walking distance to restaurants, shops, and nightlife.', 'New York, NY', 40.7128, -74.0060, 200.00, 1, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'active', ARRAY['WiFi', 'Gym', 'Doorman', 'Air Conditioning']),
-- ('Mountain Retreat', 'Cozy cabin nestled in the mountains. Perfect for hiking enthusiasts and nature lovers.', 'Aspen, CO', 39.1911, -106.8175, 275.00, 2, 2, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800', 'active', ARRAY['WiFi', 'Fireplace', 'Hot Tub', 'Mountain View', 'Parking']),
-- ('Historic Townhouse', 'Charming townhouse in a historic neighborhood. Original details with modern amenities.', 'Boston, MA', 42.3601, -71.0589, 225.00, 2, 1, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 'active', ARRAY['WiFi', 'Garden', 'Washer/Dryer', 'Air Conditioning']),
-- ('Lakeside Cottage', 'Peaceful cottage on the lake. Includes private dock and kayaks.', 'Lake Tahoe, CA', 39.0968, -120.0324, 300.00, 3, 2, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800', 'active', ARRAY['WiFi', 'Lake Access', 'Kayaks', 'Fire Pit', 'BBQ']),
-- ('Urban Studio', 'Sleek studio apartment perfect for business travelers or solo adventurers.', 'San Francisco, CA', 37.7749, -122.4194, 150.00, 0, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'active', ARRAY['WiFi', 'Workspace', 'Coffee Maker', 'Air Conditioning']);