import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAppContext } from '../context/AppContext';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setIsAuthenticated } = useAppContext();

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      handleAuthChange('SIGNED_IN', session);
    } catch (err) {
      console.error('Error checking session:', err);
    }
  };

  const handleAuthChange = async (event: string, session: any) => {
    if (session) {
      setUser({
        id: session.user.id,
        username: session.user.email || '',
        name: session.user.user_metadata.name || 'User',
        role: session.user.user_metadata.role || 'staff',
        createdAt: session.user.created_at
      });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      // First verify the current password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      });

      if (signInError) throw new Error('Current password is incorrect');

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while changing password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signOut,
    changePassword,
    loading,
    error,
    clearError: () => setError(null)
  };
};