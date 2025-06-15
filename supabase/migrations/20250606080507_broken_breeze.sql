/*
  # Create demo user for testing
  
  1. Creates a demo admin user if it doesn't exist
  2. Ensures proper authentication setup
*/

-- Insert demo user into auth.users if it doesn't exist
DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  -- Check if demo user already exists
  SELECT id INTO demo_user_id
  FROM auth.users
  WHERE email = 'admin@mrmedical.com';
  
  -- If user doesn't exist, create it
  IF demo_user_id IS NULL THEN
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
    ) RETURNING id INTO demo_user_id;
    
    -- Insert corresponding user profile
    INSERT INTO public.users (id, name, email, role, active)
    VALUES (demo_user_id, 'Admin User', 'admin@mrmedical.com', 'admin', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;