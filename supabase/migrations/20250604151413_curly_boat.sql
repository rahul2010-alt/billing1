/*
  # Fix users table and policies
  
  1. Creates users table if not exists
  2. Enables RLS
  3. Creates policies if they don't exist
  4. Imports initial users
  5. Sets first user as admin
*/

-- First ensure the users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read all users'
  ) THEN
    CREATE POLICY "Users can read all users"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Only admins can create users'
  ) THEN
    CREATE POLICY "Only admins can create users"
      ON public.users
      FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Only admins can update users'
  ) THEN
    CREATE POLICY "Only admins can update users"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Only admins can delete users'
  ) THEN
    CREATE POLICY "Only admins can delete users"
      ON public.users
      FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END $$;

-- Insert initial users from auth.users if they don't exist
INSERT INTO public.users (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email) as name,
  COALESCE(raw_user_meta_data->>'role', 'staff') as role
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Set first user as admin
UPDATE public.users
SET role = 'admin'
WHERE id = (
  SELECT id FROM public.users
  ORDER BY created_at ASC
  LIMIT 1
);