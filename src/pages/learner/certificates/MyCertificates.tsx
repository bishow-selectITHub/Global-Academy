import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Award, Download, Share2, Search } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string;
  thumbnail: string;
}

const MyCertificates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock certificate data
  const certificates: Certificate[] = [
    {
      id: 'cert-001',
      title: 'Onboarding Essentials',
      courseName: 'Onboarding Essentials',
      issueDate: 'May 15, 2025',
      thumbnail: 'https://images.pexels.com/photos/6457517/pexels-photo-6457517.jpeg?auto=compress&cs=tinysrgb&w=500'
    },
    {
      id: 'cert-002',
      title: 'Data Security Fundamentals',
      courseName: 'Data Security Fundamentals',
      issueDate: 'June 3, 2025',
      expiryDate: 'June 3, 2027',
      thumbnail: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=500'
    }
  ];
  
  // Filter certificates based on search query
  const filteredCertificates = certificates.filter(cert => 
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDownload = (certificateId: string) => {
    // In a real app, this would trigger a certificate download
    console.log(`Downloading certificate ${certificateId}`);
    alert(`Certificate download started for ${certificateId}`);
  };
  
  const handleShare = (certificateId: string) => {
    // In a real app, this would open a sharing dialog
    console.log(`Sharing certificate ${certificateId}`);
    alert(`Share dialog for certificate ${certificateId}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Certificates</h1>
        <p className="text-slate-600">
          View and download your earned certificates
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search certificates..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map(certificate => (
            <Card key={certificate.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video overflow-hidden bg-slate-100">
                <img 
                  src={certificate.thumbnail} 
                  alt={certificate.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Certified
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">
                      {certificate.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {certificate.courseName}
                    </p>
                    
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center text-xs text-slate-600">
                        <span className="font-medium mr-2">Issued on:</span>
                        <span>{certificate.issueDate}</span>
                      </div>
                      
                      {certificate.expiryDate && (
                        <div className="flex items-center text-xs text-slate-600">
                          <span className="font-medium mr-2">Valid until:</span>
                          <span>{certificate.expiryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-1">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-2">
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={() => handleDownload(certificate.id)}
                    leftIcon={<Download size={16} />}
                    fullWidth
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(certificate.id)}
                    leftIcon={<Share2 size={16} />}
                  >
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Award size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Certificates Found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery ? `No certificates matching "${searchQuery}"` : 'You haven\'t earned any certificates yet. Complete courses to earn certificates.'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* If user has certificates but no search results */}
      {certificates.length > 0 && filteredCertificates.length === 0 && (
        <div className="mt-4 text-center">
          <p className="text-slate-600">
            No certificates match your search. Try a different term or{' '}
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:underline"
            >
              clear the search
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default MyCertificates;