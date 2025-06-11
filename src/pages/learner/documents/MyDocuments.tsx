import { useState } from 'react';
import { 
  FileText, 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  Clock, 
  Filter, 
  MoreVertical,
  File,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toaster';

// Types for documents
interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string; // pdf, doc, image, etc.
  fileSize: string;
  uploadDate: string;
  status: 'approved' | 'pending' | 'rejected';
  category: string;
  description?: string;
}

const MyDocuments = () => {
  const { addToast } = useToast();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Mock document data
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc1',
      title: 'Employee Handbook Acknowledgement',
      fileName: 'employee_handbook_signed.pdf',
      fileType: 'pdf',
      fileSize: '2.4 MB',
      uploadDate: 'Apr 12, 2025',
      status: 'approved',
      category: 'Onboarding',
      description: 'Signed acknowledgement of company policies and procedures.'
    },
    {
      id: 'doc2',
      title: 'Training Certificate',
      fileName: 'data_security_cert.pdf',
      fileType: 'pdf',
      fileSize: '1.8 MB',
      uploadDate: 'May 5, 2025',
      status: 'approved',
      category: 'Certificates'
    },
    {
      id: 'doc3',
      title: 'Expense Report',
      fileName: 'q2_expenses.xlsx',
      fileType: 'xlsx',
      fileSize: '356 KB',
      uploadDate: 'Jun 10, 2025',
      status: 'pending',
      category: 'Reports'
    }
  ]);
  
  // Apply filters and search
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  // Get all unique categories
  const categories = ['all', ...new Set(documents.map(doc => doc.category))];
  
  // Handle document upload (mock function)
  const handleUpload = () => {
    // In a real app, this would open a file picker and upload the document
    addToast({
      type: 'info',
      title: 'Upload Document',
      message: 'This would open a file picker in a real application',
      duration: 3000
    });
  };
  
  // Handle document download (mock function)
  const handleDownload = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    
    // In a real app, this would trigger a file download
    addToast({
      type: 'success',
      title: 'Download Started',
      message: `Downloading ${document?.fileName}`,
      duration: 3000
    });
  };
  
  // Handle document deletion (mock function)
  const handleDelete = (documentId: string) => {
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== documentId));
      
      addToast({
        type: 'success',
        title: 'Document Deleted',
        message: 'The document has been removed',
        duration: 3000
      });
    }
  };
  
  // Get icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-8 w-8 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-slate-500" />;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock size={12} className="mr-1" />
            Pending
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle size={12} className="mr-1" />
            Rejected
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Documents</h1>
        <p className="text-slate-600">
          View and manage your uploaded documents
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
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
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <Button leftIcon={<Upload size={16} />} onClick={handleUpload}>
            Upload
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map(document => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            {getFileIcon(document.fileType)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{document.title}</div>
                            <div className="text-sm text-gray-500">{document.fileName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-800">
                          {document.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(document.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {document.uploadDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {document.fileSize}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleDownload(document.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(document.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
                <FileText size={48} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No documents found</h3>
              <p className="text-slate-500 mb-4">
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload a document to get started'}
              </p>
              {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  leftIcon={<Upload size={16} />}
                  onClick={handleUpload}
                >
                  Upload Document
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Upload Guidelines Card */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Document Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Accepted File Types</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>PDF Documents (.pdf)</li>
                  <li>Word Documents (.doc, .docx)</li>
                  <li>Excel Spreadsheets (.xls, .xlsx)</li>
                  <li>Images (.jpg, .png)</li>
                </ul>
              </div>
              
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Size Limits</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>Maximum file size: 10 MB</li>
                  <li>Maximum total storage: 100 MB</li>
                </ul>
              </div>
              
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Review Process</h4>
                <p className="text-sm text-slate-600">
                  Uploaded documents are reviewed within 24-48 hours before being marked as approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyDocuments;