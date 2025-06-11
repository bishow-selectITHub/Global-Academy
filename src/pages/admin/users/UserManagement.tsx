import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, MoreVertical, User, Mail, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toaster';

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
}

const UserManagement = () => {
  const { addToast } = useToast();
  
  // Mock user data
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      role: 'Learner',
      department: 'Marketing',
      joinDate: '2023-05-15',
      status: 'active',
      lastLogin: '2025-04-10 09:23 AM'
    },
    {
      id: '2',
      name: 'Samantha Lee',
      email: 'samantha.lee@example.com',
      role: 'Admin',
      department: 'HR',
      joinDate: '2022-11-03',
      status: 'active',
      lastLogin: '2025-04-11 02:45 PM'
    },
    {
      id: '3',
      name: 'Michael Rodriguez',
      email: 'michael.r@example.com',
      role: 'Learner',
      department: 'Sales',
      joinDate: '2024-01-22',
      status: 'active',
      lastLogin: '2025-04-09 11:10 AM'
    },
    {
      id: '4',
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      role: 'Learner',
      department: 'Product',
      joinDate: '2023-08-07',
      status: 'inactive',
      lastLogin: '2025-03-15 04:30 PM'
    },
    {
      id: '5',
      name: 'David Williams',
      email: 'david.w@example.com',
      role: 'Learner',
      department: 'Finance',
      joinDate: '2024-02-18',
      status: 'pending',
      lastLogin: undefined
    }
  ]);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Learner',
    department: '',
  });

  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus.toLowerCase();
    const matchesDepartment = selectedDepartment === 'All' || user.department === selectedDepartment;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // Handler for adding a new user
  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.department) {
      addToast({
        type: 'error',
        title: 'Missing fields',
        message: 'Please fill in all required fields.',
        duration: 3000,
      });
      return;
    }
    
    // In a real app, this would make an API call
    const newUserData: UserData = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    
    setUsers([...users, newUserData]);
    setNewUser({
      name: '',
      email: '',
      role: 'Learner',
      department: '',
    });
    setShowAddUserModal(false);
    
    addToast({
      type: 'success',
      title: 'User added successfully',
      duration: 3000,
    });
  };

  // Handler for deleting a user
  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // In a real app, this would make an API call
      setUsers(users.filter(user => user.id !== id));
      
      addToast({
        type: 'success',
        title: 'User deleted successfully',
        duration: 3000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setShowAddUserModal(true)}
        >
          Add New User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Learner">Learner</option>
              </select>
              
              <select
                className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
              
              <select
                className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Product">Product</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-slate-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : user.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.lastLogin || 'Never logged in'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-slate-500">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                <p className="text-sm text-slate-600">Total Users</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">
                  {users.filter(user => user.status === 'active').length}
                </div>
                <p className="text-sm text-slate-600">Active Users</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">
                  {users.filter(user => user.role === 'Admin').length}
                </div>
                <p className="text-sm text-slate-600">Admins</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">
                  {users.filter(user => user.status === 'pending').length}
                </div>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users
                .filter(user => user.lastLogin)
                .sort((a, b) => {
                  if (!a.lastLogin || !b.lastLogin) return 0;
                  return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
                })
                .slice(0, 3)
                .map(user => (
                  <div key={user.id} className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.lastLogin}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(new Set(users.map(user => user.department))).map(department => {
                const count = users.filter(user => user.department === department).length;
                const percentage = Math.round((count / users.length) * 100);
                
                return (
                  <div key={department}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{department}</span>
                      <span className="text-sm font-medium text-slate-700">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Add New User</h2>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <Input
                id="name"
                label="Full Name"
                leftIcon={<User size={18} />}
                placeholder="Enter user's full name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                fullWidth
              />
              
              <Input
                id="email"
                type="email"
                label="Email Address"
                leftIcon={<Mail size={18} />}
                placeholder="Enter email address"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                fullWidth
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield size={18} className="text-slate-400" />
                  </div>
                  <select
                    className="pl-10 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="Learner">Learner</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddUserModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;