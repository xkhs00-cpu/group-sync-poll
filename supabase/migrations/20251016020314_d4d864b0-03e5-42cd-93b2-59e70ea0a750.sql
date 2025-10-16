-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add user_id column to schedules for ownership tracking
ALTER TABLE public.schedules ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Migrate existing plaintext passwords to hashed format
UPDATE public.schedules 
SET password = crypt(password, gen_salt('bf'));

-- Drop old insecure policies
DROP POLICY IF EXISTS "Anyone can view schedules" ON public.schedules;
DROP POLICY IF EXISTS "Anyone can create schedules" ON public.schedules;
DROP POLICY IF EXISTS "Anyone can update schedules" ON public.schedules;
DROP POLICY IF EXISTS "Anyone can delete schedules" ON public.schedules;

DROP POLICY IF EXISTS "Anyone can view participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can create participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can update participants" ON public.participants;
DROP POLICY IF EXISTS "Anyone can delete participants" ON public.participants;

DROP POLICY IF EXISTS "Anyone can view date_selections" ON public.date_selections;
DROP POLICY IF EXISTS "Anyone can create date_selections" ON public.date_selections;
DROP POLICY IF EXISTS "Anyone can update date_selections" ON public.date_selections;
DROP POLICY IF EXISTS "Anyone can delete date_selections" ON public.date_selections;

DROP POLICY IF EXISTS "Anyone can view time_options" ON public.time_options;
DROP POLICY IF EXISTS "Anyone can create time_options" ON public.time_options;
DROP POLICY IF EXISTS "Anyone can update time_options" ON public.time_options;
DROP POLICY IF EXISTS "Anyone can delete time_options" ON public.time_options;

-- Secure RLS policies for schedules
CREATE POLICY "Users can view their own schedules"
ON public.schedules FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all schedules"
ON public.schedules FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create schedules"
ON public.schedules FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own schedules"
ON public.schedules FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own schedules"
ON public.schedules FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can delete any schedule"
ON public.schedules FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Secure RLS policies for participants
CREATE POLICY "Users can view participants of their schedules"
ON public.participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = participants.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all participants"
ON public.participants FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create participants in their schedules"
ON public.participants FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = participants.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update participants in their schedules"
ON public.participants FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = participants.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete participants in their schedules"
ON public.participants FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = participants.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

-- Secure RLS policies for date_selections
CREATE POLICY "Users can view date_selections of their schedules"
ON public.date_selections FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = date_selections.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all date_selections"
ON public.date_selections FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create date_selections in their schedules"
ON public.date_selections FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = date_selections.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update date_selections in their schedules"
ON public.date_selections FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = date_selections.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete date_selections in their schedules"
ON public.date_selections FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = date_selections.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

-- Secure RLS policies for time_options
CREATE POLICY "Users can view time_options of their schedules"
ON public.time_options FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = time_options.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all time_options"
ON public.time_options FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create time_options in their schedules"
ON public.time_options FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = time_options.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update time_options in their schedules"
ON public.time_options FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = time_options.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete time_options in their schedules"
ON public.time_options FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schedules
    WHERE schedules.id = time_options.schedule_id
    AND schedules.user_id = auth.uid()
  )
);

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Trigger to create profile and assign role on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();