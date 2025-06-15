import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface Backup {
  id: string;
  createdAt: string;
  size: number;
  status: 'completed' | 'in_progress';
  downloadUrl: string;
}

export const useBackup = () => {
  const [backupHistory, setBackupHistory] = useState<Backup[]>([]);
  const [lastBackup, setLastBackup] = useState<Backup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBackupHistory();
  }, []);

  const fetchBackupHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch backup history from Supabase
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const backups = data.map(backup => ({
        id: backup.id,
        createdAt: backup.created_at,
        size: backup.size,
        status: backup.status,
        downloadUrl: backup.download_url
      }));

      setBackupHistory(backups);
      setLastBackup(backups[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching backup history');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setError(null);

      // Create a new backup using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-backup');

      if (error) throw error;

      // Refresh backup history
      await fetchBackupHistory();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating backup');
      throw err;
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      setError(null);

      // Restore backup using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: { backupId }
      });

      if (error) throw error;

      // Refresh backup history
      await fetchBackupHistory();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while restoring backup');
      throw err;
    }
  };

  return {
    backupHistory,
    lastBackup,
    loading,
    error,
    createBackup,
    restoreBackup,
    refreshHistory: fetchBackupHistory
  };
};