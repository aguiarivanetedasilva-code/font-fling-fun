
-- Table to track site visits with IP, location, device info
CREATE TABLE public.site_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  device_type TEXT DEFAULT 'desktop',
  browser TEXT,
  os TEXT,
  user_agent TEXT,
  page TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  is_online BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track site events (pix_copied, order_created, etc.)
CREATE TABLE public.site_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- site_visits: anyone can insert (for tracking), only admins can read
CREATE POLICY "Anyone can insert visits" ON public.site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read visits" ON public.site_visits FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can update own session" ON public.site_visits FOR UPDATE USING (true);

-- site_events: anyone can insert, only admins can read
CREATE POLICY "Anyone can insert events" ON public.site_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read events" ON public.site_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- profiles: users can manage their own
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_roles: only admins can read, no self-assignment
CREATE POLICY "Admins can read roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for site_visits (online tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
