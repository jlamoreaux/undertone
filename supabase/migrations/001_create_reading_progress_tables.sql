-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create reading_progress table
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_name TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  read_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure unique entries per user, book, chapter, and date
  UNIQUE(user_id, book_name, chapter, read_date)
);

-- Create last_sync table to track sync status
CREATE TABLE IF NOT EXISTS public.last_sync (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  device_info JSONB
);

-- Create indexes for better query performance
CREATE INDEX idx_reading_progress_user_id ON public.reading_progress(user_id);
CREATE INDEX idx_reading_progress_book_name ON public.reading_progress(book_name);
CREATE INDEX idx_reading_progress_read_date ON public.reading_progress(read_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.last_sync ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for reading_progress table
CREATE POLICY "Users can view own reading progress" ON public.reading_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading progress" ON public.reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading progress" ON public.reading_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading progress" ON public.reading_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for last_sync table
CREATE POLICY "Users can view own sync status" ON public.last_sync
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync status" ON public.last_sync
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync status" ON public.last_sync
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON public.reading_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
