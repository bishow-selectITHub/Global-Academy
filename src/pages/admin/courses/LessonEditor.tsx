import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, FileText, Video, Image, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import { useToast } from '../../../components/ui/Toaster';

// Types for a lesson
interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  type: 'text' | 'video' | 'quiz';
  duration: number;
  resources?: Resource[];
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'link';
  url: string;
}

// For demo purposes, we'll use this to simulate lesson data
const mockLesson: Lesson = {
  id: 'lesson-1',
  courseId: 'course-1',
  title: 'Introduction to the Platform',
  content: `
    <h2>Welcome to GlobalSelect Academy</h2>
    <p>This introductory lesson will guide you through the main features of our learning platform.</p>
    <h3>Key Learning Objectives:</h3>
    <ul>
      <li>Understand the navigation structure</li>
      <li>Learn how to track your progress</li>
      <li>Discover how to earn certificates</li>
    </ul>
    <p>Let's get started with the basics of using the platform effectively...</p>
  `,
  order: 1,
  type: 'text',
  duration: 15,
  resources: [
    {
      id: 'resource-1',
      title: 'Platform Quick Guide',
      type: 'pdf',
      url: 'https://example.com/platform-guide.pdf'
    },
    {
      id: 'resource-2',
      title: 'Navigation Overview',
      type: 'image',
      url: 'https://example.com/navigation.jpg'
    }
  ]
};

const LessonEditor = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditMode = !!lessonId;
  
  // State for the form
  const [lesson, setLesson] = useState<Lesson>({
    id: '',
    courseId: courseId || '',
    title: '',
    content: '',
    order: 1,
    type: 'text',
    duration: 10,
    resources: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'pdf' as const,
    url: ''
  });
  const [previewMode, setPreviewMode] = useState(false);

  // Load lesson data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // For now, we'll simulate loading with the mock data
      setTimeout(() => {
        setLesson(mockLesson);
        setIsLoading(false);
      }, 800);
    }
  }, [isEditMode, lessonId]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLesson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for updating content from rich text editor
  const handleContentChange = (newContent: string) => {
    setLesson(prev => ({
      ...prev,
      content: newContent
    }));
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!lesson.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!lesson.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (lesson.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addToast({
        type: 'success',
        title: `Lesson ${isEditMode ? 'updated' : 'created'} successfully`,
        duration: 5000
      });
      
      // Navigate back to the course editor
      navigate(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error('Error saving lesson:', error);
      addToast({
        type: 'error',
        title: 'Failed to save lesson',
        message: 'Please try again later',
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new resource
  const handleAddResource = () => {
    if (!newResource.title || !newResource.url) {
      return;
    }
    
    setLesson(prev => ({
      ...prev,
      resources: [
        ...(prev.resources || []),
        {
          id: `resource-${Date.now()}`,
          ...newResource
        }
      ]
    }));
    
    setNewResource({
      title: '',
      type: 'pdf',
      url: ''
    });
  };

  // Remove a resource
  const handleRemoveResource = (resourceId: string) => {
    setLesson(prev => ({
      ...prev,
      resources: prev.resources?.filter(resource => resource.id !== resourceId) || []
    }));
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate(`/admin/courses/${courseId}`)}
              className="mr-4"
            >
              Back to Course
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Lesson' : 'Create New Lesson'}
            </h1>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={togglePreviewMode}
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save size={16} />}
              isLoading={isSaving}
              onClick={handleSubmit}
            >
              Save Lesson
            </Button>
          </div>
        </div>

        {previewMode ? (
          // Preview Mode
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {lesson.type === 'video' && <Video size={20} className="text-red-500 mr-2" />}
                {lesson.type === 'text' && <FileText size={20} className="text-blue-500 mr-2" />}
                {lesson.type === 'quiz' && <FileText size={20} className="text-amber-500 mr-2" />}
                {lesson.title || 'Lesson Title'}
              </CardTitle>
              <CardDescription>
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>{lesson.duration} minutes</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }}></div>
              
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="mt-8 border-t pt-6 dark:border-slate-700">
                  <h3 className="text-lg font-medium mb-3 dark:text-slate-200">Resources</h3>
                  <div className="space-y-2">
                    {lesson.resources.map(resource => (
                      <div key={resource.id} className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                        {resource.type === 'pdf' && <FileText size={18} className="text-red-500 mr-2" />}
                        {resource.type === 'image' && <Image size={18} className="text-blue-500 mr-2" />}
                        {resource.type === 'link' && <Link size={18} className="text-green-500 mr-2" />}
                        <div>
                          <p className="font-medium text-sm dark:text-slate-200">{resource.title}</p>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                            {resource.url}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Details</CardTitle>
                <CardDescription>Basic information about the lesson</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  id="title"
                  name="title"
                  label="Lesson Title"
                  placeholder="Enter lesson title"
                  value={lesson.title}
                  onChange={handleChange}
                  error={errors.title}
                  fullWidth
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Lesson Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={lesson.type}
                      onChange={handleChange}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="text">Text Lesson</option>
                      <option value="video">Video Lesson</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    label="Duration (minutes)"
                    leftIcon={<Clock size={18} />}
                    value={lesson.duration.toString()}
                    onChange={handleChange}
                    error={errors.duration}
                    fullWidth
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Lesson Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    min="1"
                    value={lesson.order}
                    onChange={handleChange}
                    className="block w-24 rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
                <CardDescription>The main content of your lesson</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <RichTextEditor 
                    content={lesson.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your lesson content here..."
                    minHeight="400px"
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lesson Resources</CardTitle>
                <CardDescription>Additional materials for learners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lesson.resources && lesson.resources.length > 0 ? (
                    <div className="space-y-2">
                      {lesson.resources.map(resource => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                          <div className="flex items-center">
                            {resource.type === 'pdf' && <FileText size={18} className="text-red-500 dark:text-red-400 mr-2" />}
                            {resource.type === 'image' && <Image size={18} className="text-blue-500 dark:text-blue-400 mr-2" />}
                            {resource.type === 'link' && <Link size={18} className="text-green-500 dark:text-green-400 mr-2" />}
                            <div>
                              <p className="font-medium text-sm dark:text-slate-200">{resource.title}</p>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                {resource.url}
                              </a>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 size={16} />}
                            onClick={() => handleRemoveResource(resource.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No resources added yet.</p>
                  )}

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Add New Resource</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        id="resourceTitle"
                        placeholder="Resource Title"
                        value={newResource.title}
                        onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                        fullWidth
                      />
                      
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource({...newResource, type: e.target.value as 'pdf' | 'image' | 'link'})}
                        className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="pdf">PDF Document</option>
                        <option value="image">Image</option>
                        <option value="link">External Link</option>
                      </select>
                      
                      <div className="flex space-x-2">
                        <Input
                          id="resourceUrl"
                          placeholder="URL"
                          value={newResource.url}
                          onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                          fullWidth
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={handleAddResource}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(`/admin/courses/${courseId}`)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save size={16} />}
            isLoading={isSaving}
            onClick={handleSubmit}
          >
            {isEditMode ? 'Update Lesson' : 'Create Lesson'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonEditor;