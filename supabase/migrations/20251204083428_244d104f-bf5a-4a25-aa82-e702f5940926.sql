-- -- Drop existing restrictive policies
-- DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
-- DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- -- Create permissive policies (OR logic)
-- CREATE POLICY "Admins can view all roles"
-- ON public.user_roles
-- FOR SELECT
-- USING (public.has_role(auth.uid(), 'admin'));

-- CREATE POLICY "Users can view their own roles"
-- ON public.user_roles
-- FOR SELECT
-- USING (auth.uid() = user_id);

-- CREATE POLICY "Admins can insert roles"
-- ON public.user_roles
-- FOR INSERT
-- WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CREATE POLICY "Admins can update roles"
-- ON public.user_roles
-- FOR UPDATE
-- USING (public.has_role(auth.uid(), 'admin'));

-- CREATE POLICY "Admins can delete roles"
-- ON public.user_roles
-- FOR DELETE
-- USING (public.has_role(auth.uid(), 'admin'));