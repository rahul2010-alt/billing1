import React, { useState } from 'react';
import { Download, Upload, Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useBackup } from '../../utils/hooks/useBackup';

const BackupPage: React.FC = () => {
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const { createBackup, restoreBackup, lastBackup, backupHistory } = useBackup();

  const handleCreateBackup = async () => {
    try {
      setBackupInProgress(true);
      await createBackup();
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    try {
      setRestoreInProgress(true);
      await restoreBackup(backupId);
    } finally {
      setRestoreInProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Backup</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage database backups and restoration
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Database className="h-4 w-4" />}
          onClick={handleCreateBackup}
          loading={backupInProgress}
          disabled={backupInProgress}
        >
          Create New Backup
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Last Backup</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              {lastBackup ? new Date(lastBackup.createdAt).toLocaleDateString() : 'Never'}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {lastBackup ? `Size: ${lastBackup.size}` : 'No backups available'}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Backups</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              {backupHistory.length}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Available for restoration
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Storage Used</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              {backupHistory.reduce((total, backup) => total + backup.size, 0)} MB
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Total backup storage
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Backup History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backupHistory.map((backup) => (
                  <tr key={backup.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(backup.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(backup.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.size} MB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        backup.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {backup.status.charAt(0).toUpperCase() + backup.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Download className="h-4 w-4" />}
                          onClick={() => window.location.href = backup.downloadUrl}
                        >
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<RefreshCw className="h-4 w-4" />}
                          onClick={() => handleRestoreBackup(backup.id)}
                          loading={restoreInProgress}
                          disabled={restoreInProgress}
                        >
                          Restore
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BackupPage;