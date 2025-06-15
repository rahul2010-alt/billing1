import React, { useState } from 'react';
import { Users as UsersIcon, Plus, Search, Shield, Mail, UserPlus } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import Table from '../UI/Table';
import { useUsers } from '../../utils/hooks/useUsers';

const UsersPage: React.FC = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'manager' | 'staff',
    password: '',
    confirmPassword: ''
  });

  const filteredUsers = searchQuery
    ? users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      // Handle password mismatch
      return;
    }

    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });
      setShowAddUser(false);
      setFormData({
        name: '',
        email: '',
        role: 'staff',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts and permissions
          </p>
        </div>
        <Button
          variant="primary"
          icon={<UserPlus className="h-4 w-4" />}
          onClick={() => setShowAddUser(true)}
        >
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{users.length}</p>
              </div>
              <UsersIcon className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Administrators</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {users.filter(user => user.role === 'admin').length}
                </p>
              </div>
              <Shield className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {users.filter(user => user.active).length}
                </p>
              </div>
              <Mail className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              className="w-full md:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <Table
              columns={[
                {
                  header: 'User',
                  accessor: (user: any) => (
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  ),
                },
                {
                  header: 'Role',
                  accessor: (user: any) => (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  ),
                },
                {
                  header: 'Status',
                  accessor: (user: any) => (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  ),
                },
                {
                  header: 'Last Login',
                  accessor: (user: any) => user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
                },
                {
                  header: 'Actions',
                  accessor: (user: any) => (
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowAddUser(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={filteredUsers}
              loading={loading}
              emptyMessage="No users found"
            />
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showAddUser}
        onClose={() => {
          setShowAddUser(false);
          setSelectedUser(null);
          setFormData({
            name: '',
            email: '',
            role: 'staff',
            password: '',
            confirmPassword: ''
          });
        }}
        title={selectedUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {!selectedUser && (
            <>
              <Input
                type="password"
                label="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Input
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddUser(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;