import { useState } from 'react';
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  MoreVertical, 
  Image, 
  User, 
  Calendar,
  FileText,
  Info,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toaster';

// Mock certificate template data
interface CertificateTemplate {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  createdAt: string;
  lastModified: string;
  isDefault: boolean;
  courseId?: string;
  courseName?: string;
}

const CertificateTemplates = () => {
  const { addToast } = useToast();
  
  // Mock data for certificate templates
  const [templates, setTemplates] = useState<CertificateTemplate[]>([
    {
      id: '1',
      title: 'Standard Completion Certificate',
      description: 'Default certificate awarded upon course completion',
      thumbnail: 'https://images.pexels.com/photos/6120251/pexels-photo-6120251.jpeg?auto=compress&cs=tinysrgb&w=500',
      createdAt: '2024-02-15',
      lastModified: '2024-03-20',
      isDefault: true,
    },
    {
      id: '2',
      title: 'Data Security Certification',
      description: 'Specialized certificate for data security training',
      thumbnail: 'https://images.pexels.com/photos/5474295/pexels-photo-5474295.jpeg?auto=compress&cs=tinysrgb&w=500',
      createdAt: '2024-03-05',
      lastModified: '2024-03-05',
      isDefault: false,
      courseId: 'c2',
      courseName: 'Data Security Fundamentals',
    },
    {
      id: '3',
      title: 'Leadership Excellence Award',
      description: 'Certificate for leadership program graduates',
      thumbnail: 'https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=500',
      createdAt: '2024-01-10',
      lastModified: '2024-03-18',
      isDefault: false,
      courseId: 'c5',
      courseName: 'Leadership Essentials',
    },
  ]);

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);
  
  // State for new template form
  const [newTemplate, setNewTemplate] = useState<Partial<CertificateTemplate>>({
    title: '',
    description: '',
    thumbnail: '',
  });

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding a new template
  const handleAddTemplate = () => {
    if (!newTemplate.title || !newTemplate.description) {
      addToast({
        type: 'error',
        title: 'Missing fields',
        message: 'Please fill in all required fields',
        duration: 3000,
      });
      return;
    }

    const newTemplateData: CertificateTemplate = {
      id: `template-${Date.now()}`,
      title: newTemplate.title || '',
      description: newTemplate.description || '',
      thumbnail: newTemplate.thumbnail || 'https://images.pexels.com/photos/3760778/pexels-photo-3760778.jpeg?auto=compress&cs=tinysrgb&w=500',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      isDefault: false,
      courseId: newTemplate.courseId,
      courseName: newTemplate.courseId === 'c1' ? 'Onboarding Essentials' : 
                 newTemplate.courseId === 'c2' ? 'Data Security Fundamentals' :
                 newTemplate.courseId === 'c3' ? 'Client Communication' : undefined,
    };

    setTemplates([...templates, newTemplateData]);
    setNewTemplate({
      title: '',
      description: '',
      thumbnail: '',
    });
    setShowAddModal(false);

    addToast({
      type: 'success',
      title: 'Certificate template created',
      duration: 3000,
    });
  };

  // Handle template deletion
  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const template = templates.find(t => t.id === id);
      if (template?.isDefault) {
        addToast({
          type: 'error',
          title: 'Cannot delete default template',
          message: 'Please set another template as default first.',
          duration: 3000,
        });
        return;
      }

      setTemplates(templates.filter(template => template.id !== id));
      
      addToast({
        type: 'success',
        title: 'Template deleted',
        duration: 3000,
      });
    }
  };

  // Handle setting a template as default
  const handleSetAsDefault = (id: string) => {
    setTemplates(templates.map(template => ({
      ...template,
      isDefault: template.id === id,
    })));

    addToast({
      type: 'success',
      title: 'Default template updated',
      duration: 3000,
    });
  };

  // Open preview modal
  const handlePreview = (template: CertificateTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Certificate Templates</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and customize certificate templates for courses</p>
        </div>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setShowAddModal(true)}
        >
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Card key={template.id} className="overflow-hidden">
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={template.thumbnail}
                alt={template.title}
                className="w-full h-full object-cover"
              />
              {template.isDefault && (
                <div className="absolute top-2 right-2 bg-blue-600 dark:bg-blue-700 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Default
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h3 className="font-semibold text-lg">{template.title}</h3>
                  {template.courseName && (
                    <p className="text-sm text-white/80">{template.courseName}</p>
                  )}
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <p>Created: {template.createdAt}</p>
                  <p>Last modified: {template.lastModified}</p>
                </div>
                <div className="relative group">
                  <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <MoreVertical size={16} className="text-slate-500 dark:text-slate-400" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg hidden group-hover:block z-10">
                    <div className="py-1">
                      <button
                        className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                        onClick={() => handlePreview(template)}
                      >
                        <Award size={16} className="mr-2" />
                        Preview
                      </button>
                      <button
                        className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </button>
                      <button
                        className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                      >
                        <Copy size={16} className="mr-2" />
                        Duplicate
                      </button>
                      <button
                        className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                      >
                        <Download size={16} className="mr-2" />
                        Download
                      </button>
                      {!template.isDefault && (
                        <button
                          className="flex items-center px-4 py-2 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full text-left"
                          onClick={() => handleSetAsDefault(template.id)}
                        >
                          <Award size={16} className="mr-2" />
                          Set as Default
                        </button>
                      )}
                      {!template.isDefault && (
                        <button
                          className="flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{template.description}</p>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit size={14} />}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Award size={14} />}
                  onClick={() => handlePreview(template)}
                >
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-lg w-full p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create Certificate Template</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <Input
                id="title"
                name="title"
                label="Template Title"
                placeholder="e.g., Course Completion Certificate"
                value={newTemplate.title || ''}
                onChange={handleFormChange}
                fullWidth
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Brief description of this certificate template"
                  value={newTemplate.description || ''}
                  onChange={handleFormChange}
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Associate with Course (Optional)
                </label>
                <select
                  name="courseId"
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
                  value={newTemplate.courseId || ''}
                  onChange={handleFormChange}
                >
                  <option value="">Not associated with a specific course</option>
                  <option value="c1">Onboarding Essentials</option>
                  <option value="c2">Data Security Fundamentals</option>
                  <option value="c3">Client Communication</option>
                </select>
              </div>
              
              <Input
                id="thumbnail"
                name="thumbnail"
                label="Thumbnail URL"
                placeholder="https://example.com/image.jpg"
                leftIcon={<Image size={18} />}
                value={newTemplate.thumbnail || ''}
                onChange={handleFormChange}
                fullWidth
                helperText="Leave empty to use a default image"
              />
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg mt-4">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Certificate Design</h3>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  In a real application, this would include a certificate designer with options for layout, logo placement, text fields, and more.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTemplate}
              >
                Create Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-3xl w-full m-4">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Certificate Preview</h2>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Certificate Preview */}
              <div className="border-4 border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 rounded-lg mb-6 max-w-2xl mx-auto aspect-[1.414/1]">
                <div className="border-8 border-double border-slate-300 dark:border-slate-600 h-full flex flex-col items-center justify-center p-4 text-center">
                  <div className="mb-4">
                    <Award size={60} className="text-blue-600 dark:text-blue-500 mx-auto" />
                  </div>
                  <h2 className="text-2xl font-serif mb-2 dark:text-slate-100">CERTIFICATE OF COMPLETION</h2>
                  <p className="text-lg mb-6 dark:text-slate-300">This certifies that</p>
                  <p className="text-xl font-semibold mb-2 border-b border-slate-300 dark:border-slate-600 pb-1 px-8 dark:text-slate-200">Jane Smith</p>
                  <p className="text-base mb-6 dark:text-slate-300">has successfully completed</p>
                  <p className="text-xl font-bold mb-6 dark:text-slate-100">{previewTemplate.courseName || "Course Name"}</p>
                  <p className="text-sm mb-8 dark:text-slate-400">on April 15, 2025</p>
                  <div className="flex justify-between w-full px-8">
                    <div className="text-center">
                      <div className="border-t border-slate-300 dark:border-slate-600 pt-1">
                        <p className="font-semibold dark:text-slate-200">John Doe</p>
                        <p className="text-xs dark:text-slate-400">Instructor</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-slate-300 dark:border-slate-600 pt-1">
                        <p className="font-semibold dark:text-slate-200">GlobalSelect Academy</p>
                        <p className="text-xs dark:text-slate-400">Certificate ID: GS-2025-12345</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </Button>
                <Button
                  leftIcon={<Download size={16} />}
                  onClick={() => {
                    addToast({
                      type: 'info',
                      title: 'Download started',
                      message: 'Certificate PDF is being generated',
                      duration: 3000,
                    });
                  }}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional info */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Issuance Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3">Automatic Issuance</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Certificates are automatically issued when a learner completes all required components of a course. 
                  This includes all lessons, quizzes, and assignments.
                </p>
                
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 p-4 rounded-r">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Certificate templates are automatically selected based on course associations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-1" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Customization Options</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Admins can customize certificates with organization logo, signature, and specific text fields.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-1" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Learner Information</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Certificates automatically include learner name, course title, and completion date.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-1" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Validity Period</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Certificates can be configured with optional expiration dates for certifications that require renewal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateTemplates;