import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User } from '../../types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
    password: string;
  }) => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (authError) throw authError;

      // Then create the user profile
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: authData.user?.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          active: true
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchUsers();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating user');
      throw err;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      await fetchUsers();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating user');
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // First disable the user's auth account
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // Then delete the user profile
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting user');
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers
  };
};