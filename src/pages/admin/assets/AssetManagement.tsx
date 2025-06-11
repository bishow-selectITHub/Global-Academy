import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Plus, Search, Filter, File, Folder, MoreVertical, Download, Trash2, Share } from 'lucide-react';

const AssetManagement = () => {
  // Mock data for assets
  const assets = [
    {
      id: '1',
      name: 'Employee Handbook.pdf',
      type: 'document',
      size: '2.4 MB',
      uploaded: '2023-11-15',
      category: 'Documents',
      assignedTo: 'All Employees',
    },
    {
      id: '2',
      name: 'Company Laptop',
      type: 'hardware',
      size: '-',
      uploaded: '2023-10-21',
      category: 'Hardware',
      assignedTo: 'Marketing Team',
    },
    {
      id: '3',
      name: 'Training Videos Collection',
      type: 'folder',
      size: '1.2 GB',
      uploaded: '2023-12-05',
      category: 'Media',
      assignedTo: 'New Hires',
    },
    {
      id: '4',
      name: 'Project Management Software License',
      type: 'license',
      size: '-',
      uploaded: '2024-01-10',
      category: 'Software',
      assignedTo: 'Project Managers',
    },
    {
      id: '5',
      name: 'Company Logo Pack.zip',
      type: 'document',
      size: '15.7 MB',
      uploaded: '2023-09-30',
      category: 'Media',
      assignedTo: 'All Employees',
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Asset Management</h1>
        <Button leftIcon={<Plus size={16} />}>
          Add New Asset
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-500" />
            <select 
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="documents">Documents</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="media">Media</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Asset Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {asset.type === 'folder' ? (
                          <Folder className="h-5 w-5 text-blue-500" />
                        ) : (
                          <File className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-slate-900">{asset.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-800">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {asset.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {asset.uploaded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {asset.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-slate-600 hover:text-blue-700" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-slate-600 hover:text-blue-700" title="Share">
                        <Share className="h-4 w-4" />
                      </button>
                      <button className="text-slate-600 hover:text-red-700" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-slate-900 mb-1">154</div>
              <p className="text-sm text-slate-600">Total Assets</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-semibold text-blue-700">42</div>
                <p className="text-xs text-blue-600">Documents</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-semibold text-green-700">38</div>
                <p className="text-xs text-green-600">Hardware</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-semibold text-purple-700">65</div>
                <p className="text-xs text-purple-600">Software</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-semibold text-amber-700">9</div>
                <p className="text-xs text-amber-600">Other</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="relative inline-block">
                <svg className="w-24 h-24" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="2"></circle>
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="2" 
                    strokeDasharray="78.5 100" 
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-900">78%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-slate-600 mt-2">Currently in use</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Download size={16} className="text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Company Policy Manual downloaded</p>
                  <p className="text-xs text-slate-500">2 hours ago by Sarah Johnson</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Plus size={16} className="text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">New asset added: Office Projector</p>
                  <p className="text-xs text-slate-500">Yesterday by Admin</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Share size={16} className="text-amber-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Marketing Materials shared with team</p>
                  <p className="text-xs text-slate-500">2 days ago by Alex Chen</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 size={16} className="text-red-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Outdated training materials removed</p>
                  <p className="text-xs text-slate-500">Last week by Admin</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetManagement;