import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  isValidUrl(supabaseUrl);

if (!isConfigured) {
  console.warn('⚠️ Supabase Configuration Issue');
  console.warn('Please follow these steps to fix the connection:');
  console.warn('1. Check your .env file exists in the project root');
  console.warn('2. Verify your Supabase project is active in the dashboard');
  console.warn('3. Update .env with correct values:');
  console.warn('   VITE_SUPABASE_URL=https://your-project-id.supabase.co');
  console.warn('   VITE_SUPABASE_ANON_KEY=your-anon-key-here');
  console.warn('4. Restart the development server after updating .env');
  console.warn('Current values:', {
    url: supabaseUrl || 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
}

// Create a mock client for development when Supabase is not configured
const createMockClient = () => ({
  auth: {
    signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured. Please check your .env file.') }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured. Please check your .env file.') }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: new Error('Supabase not configured. Please check your .env file.') }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured. Please check your .env file.') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured. Please check your .env file.') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured. Please check your .env file.') }),
    upsert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured. Please check your .env file.') }),
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => Promise.resolve({ unsubscribe: () => {} }).catch(() => ({ unsubscribe: () => {} }))
    })
  })
});

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        headers: { 'x-application-name': 'mr-medical-store' },
      },
      db: {
        schema: 'public',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : createMockClient();

// Add a helper to check connection
export const checkSupabaseConnection = async () => {
  try {
    // Check if Supabase is properly configured
    if (!isConfigured) {
      console.error('❌ Supabase Configuration Error');
      console.error('Please update your .env file with valid Supabase credentials.');
      console.error('See README.md for detailed setup instructions.');
      return false;
    }

    // Simple health check query with Promise.race timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
    });

    const queryPromise = supabase
      .from('products')
      .select('count')
      .limit(1);

    try {
      const { error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) {
        console.error('❌ Supabase Connection Error:', error.message);
        
        // Provide specific error guidance
        if (error.message.includes('upstream connect error') || 
            error.message.includes('503') ||
            error.message.includes('remote connection failure')) {
          console.error('This usually means:');
          console.error('1. Your Supabase project URL is incorrect');
          console.error('2. Your Supabase project is paused or deleted');
          console.error('3. Your internet connection is unstable');
          console.error('4. Supabase service is temporarily unavailable');
          console.error('');
          console.error('Please check:');
          console.error('- Your Supabase project is active in the dashboard');
          console.error('- Your .env file has the correct VITE_SUPABASE_URL');
          console.error('- Your project URL format: https://your-project-id.supabase.co');
        }
        
        return false;
      }
      
      console.log('✅ Supabase connection successful');
      return true;
    } catch (timeoutError) {
      if (timeoutError.message.includes('timeout')) {
        console.error('❌ Supabase connection timeout (10s)');
        console.error('This might indicate network issues or an incorrect URL');
      } else {
        throw timeoutError;
      }
      return false;
    }
    
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    
    // Provide helpful error messages based on error type
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - please check your internet connection');
    } else if (error.message.includes('Invalid URL')) {
      console.error('Invalid Supabase URL in .env file');
    }
    
    return false;
  }
};

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => isConfigured;

// Helper to get configuration status with detailed info
export const getSupabaseConfigStatus = () => {
  return {
    isConfigured,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isValidUrl: supabaseUrl ? isValidUrl(supabaseUrl) : false,
    url: supabaseUrl || 'Not set',
    issues: [
      !supabaseUrl && 'Missing VITE_SUPABASE_URL in .env file',
      !supabaseAnonKey && 'Missing VITE_SUPABASE_ANON_KEY in .env file',
      supabaseUrl && !isValidUrl(supabaseUrl) && 'Invalid URL format in VITE_SUPABASE_URL',
      supabaseUrl === 'your_supabase_project_url_here' && 'Please replace placeholder URL with actual Supabase URL',
      supabaseAnonKey === 'your_supabase_anon_key_here' && 'Please replace placeholder key with actual Supabase anon key'
    ].filter(Boolean)
  };
};