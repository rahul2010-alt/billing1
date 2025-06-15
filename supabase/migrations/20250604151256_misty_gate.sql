-- Add initial users
INSERT INTO public.users (id, name, email, role, active, created_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', email) as name,
  email,
  COALESCE(raw_user_meta_data->>'role', 'staff') as role,
  true as active,
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;