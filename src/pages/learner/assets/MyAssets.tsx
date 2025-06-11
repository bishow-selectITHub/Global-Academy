import { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Calendar, 
  MoreVertical,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Headphones,
  Info,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toaster';

// Asset interface
interface Asset {
  id: string;
  name: string;
  type: 'laptop' | 'phone' | 'tablet' | 'monitor' | 'headset' | 'other';
  serialNumber: string;
  assignedDate: string;
  dueDate?: string;
  status: 'active' | 'pending-return' | 'returned';
  specifications?: string;
}

// Helper function to get asset icon
const getAssetIcon = (type: Asset['type'], className: string = '') => {
  switch (type) {
    case 'laptop':
      return <Laptop className={className} />;
    case 'phone':
      return <Smartphone className={className} />;
    case 'tablet':
      return <Tablet className={className} />;
    case 'monitor':
      return <Monitor className={className} />;
    case 'headset':
      return <Headphones className={className} />;
    default:
      return <Package className={className} />;
  }
};

// Helper function to get status badge
const getStatusBadge = (status: Asset['status']) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Active
        </span>
      );
    case 'pending-return':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock size={12} className="mr-1" />
          Pending Return
        </span>
      );
    case 'returned':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          <XCircle size={12} className="mr-1" />
          Returned
        </span>
      );
  }
};

const MyAssets = () => {
  const { addToast } = useToast();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Mock asset data
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 'asset-001',
      name: 'MacBook Pro 16"',
      type: 'laptop',
      serialNumber: 'MBP2023001',
      assignedDate: '2025-02-15',
      status: 'active',
      specifications: 'M2 Pro, 32GB RAM, 1TB SSD'
    },
    {
      id: 'asset-002',
      name: 'iPhone 14 Pro',
      type: 'phone',
      serialNumber: 'IP14P003',
      assignedDate: '2025-02-15',
      status: 'active',
      specifications: '256GB, Graphite'
    },
    {
      id: 'asset-003',
      name: 'Dell 27" Monitor',
      type: 'monitor',
      serialNumber: 'DLU2723',
      assignedDate: '2024-12-10',
      dueDate: '2025-06-10',
      status: 'pending-return',
      specifications: '4K UHD, USB-C'
    },
    {
      id: 'asset-004',
      name: 'Sony WH-1000XM5',
      type: 'headset',
      serialNumber: 'SNY10XM5',
      assignedDate: '2024-10-05',
      dueDate: '2025-01-05',
      status: 'returned',
      specifications: 'Wireless Noise Cancelling'
    }
  ]);
  
  // Apply filters and search
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Request asset return
  const requestReturn = (assetId: string) => {
    // In a real app, this would make an API call to request return
    setAssets(assets.map(asset => 
      asset.id === assetId 
        ? { ...asset, status: 'pending-return' as const, dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0] }
        : asset
    ));
    
    addToast({
      type: 'success',
      title: 'Return Requested',
      message: 'Your asset return request has been submitted',
      duration: 3000
    });
  };
  
  // View asset details
  const viewAssetDetails = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      // In a real app, this would open a detailed view or modal
      addToast({
        type: 'info',
        title: `Asset Details: ${asset.name}`,
        message: `Serial: ${asset.serialNumber} - ${asset.specifications}`,
        duration: 5000
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Assets</h1>
        <p className="text-slate-600">
          View and manage assets assigned to you
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search assets..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending-return">Pending Return</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="laptop">Laptops</option>
            <option value="phone">Phones</option>
            <option value="tablet">Tablets</option>
            <option value="monitor">Monitors</option>
            <option value="headset">Headsets</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Asset Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Return Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-slate-100 rounded-lg">
                            {getAssetIcon(asset.type, "h-6 w-6 text-slate-600")}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            <div className="text-xs text-gray-500">{asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.serialNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(asset.assignedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(asset.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.dueDate ? formatDate(asset.dueDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => viewAssetDetails(asset.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          {asset.status === 'active' && (
                            <button 
                              onClick={() => requestReturn(asset.id)}
                              className="text-amber-600 hover:text-amber-900"
                              title="Request Return"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="mx-auto h-12 w-12 text-slate-400 mb-4">
                <Package size={48} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No assets found</h3>
              <p className="text-slate-500 mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You don\'t have any assets assigned to you'}
              </p>
              {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Asset Rules and Guidelines */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Asset Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Asset Care</h4>
                <p className="text-sm text-slate-600">
                  All company assets should be handled with care and kept in good condition.
                  Report any damage immediately to the IT department.
                </p>
              </div>
              
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Return Process</h4>
                <p className="text-sm text-slate-600">
                  To return an asset, click the calendar icon to request a return.
                  A return label and instructions will be emailed to you.
                </p>
              </div>
              
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Support</h4>
                <p className="text-sm text-slate-600">
                  For technical issues or support with your assets,
                  contact the IT help desk at support@globalselect.com.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyAssets;