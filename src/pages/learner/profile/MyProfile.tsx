import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter, 
  CardDescription 
} from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award,
  Settings,
  Shield,
  Bell,
  Save,
  Clock
} from 'lucide-react';
import { useUser } from '../../../contexts/UserContext';
import { useToast } from '../../../components/ui/Toaster';

const MyProfile = () => {
  const { user } = useUser();
  const { addToast } = useToast();
  
  // Extended profile information (this would come from the backend in a real app)
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    department: 'Marketing',
    position: 'Marketing Specialist',
    joinDate: 'January 15, 2025',
    bio: 'Marketing professional with 5 years of experience in digital marketing and content strategy.',
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Business Administration',
        institution: 'State University',
        year: '2021'
      }
    ],
    skills: ['Digital Marketing', 'Content Strategy', 'Social Media', 'Data Analysis'],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      learningReminders: true,
      weeklyDigest: true
    },
    security: {
      mfaEnabled: false,
      lastPasswordChange: '3 months ago',
      loginAlerts: true
    }
  });
  
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle input changes when editing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setTempProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox changes for preferences
  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setTempProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked
      }
    }));
  };
  
  // Handle security setting changes
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setTempProfile(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: checked
      }
    }));
  };
  
  // Save profile changes
  const saveChanges = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to update the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(tempProfile);
      setIsEditing(false);
      
      addToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your changes have been saved successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast({
        type: 'error',
        title: 'Update failed',
        message: 'There was an error updating your profile',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };
  
  // Add a new skill
  const addSkill = (newSkill: string) => {
    if (newSkill && !tempProfile.skills.includes(newSkill)) {
      setTempProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
    }
  };
  
  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    setTempProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  // Function to handle enabling MFA (in a real app, this would open a setup flow)
  const handleEnableMFA = () => {
    addToast({
      type: 'info',
      title: 'MFA Setup',
      message: 'This would launch the MFA setup process in a real application',
    });
  };
  
  // Change password function (in a real app, this would open a change password flow)
  const handleChangePassword = () => {
    addToast({
      type: 'info',
      title: 'Change Password',
      message: 'This would launch the password change process in a real application',
    });
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600">
          Manage your account information and preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column: Profile summary and navigation */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-blue-100">
                    <img
                      src={user?.profilePicture || "https://via.placeholder.com/96x96.png?text=User"}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full">
                      <Settings size={14} />
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{profile.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{profile.position}</p>
                
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth
                    onClick={() => setIsEditing(true)} 
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
            
            <div className="px-3 pb-4">
              <div className="mt-2">
                <nav className="space-y-1">
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'profile'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Profile Information
                  </button>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'preferences'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setActiveTab('preferences')}
                  >
                    <Bell className="mr-3 h-5 w-5" />
                    Notification Preferences
                  </button>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'security'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setActiveTab('security')}
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    Security Settings
                  </button>
                </nav>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right column: Active tab content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Your personal and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="name"
                      name="name"
                      label="Full Name"
                      leftIcon={<User size={18} />}
                      value={isEditing ? tempProfile.name : profile.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      fullWidth
                    />
                    
                    <Input
                      id="email"
                      name="email"
                      label="Email Address"
                      leftIcon={<Mail size={18} />}
                      value={isEditing ? tempProfile.email : profile.email}
                      onChange={handleChange}
                      disabled={true} // Email is typically not editable
                      fullWidth
                    />
                    
                    <Input
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      leftIcon={<Phone size={18} />}
                      value={isEditing ? tempProfile.phone : profile.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      fullWidth
                    />
                    
                    <Input
                      id="location"
                      name="location"
                      label="Location"
                      leftIcon={<MapPin size={18} />}
                      value={isEditing ? tempProfile.location : profile.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
                      Biography
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      className="w-full rounded-md shadow-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      value={isEditing ? tempProfile.bio : profile.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                    ></textarea>
                  </div>
                </CardContent>
              </Card>
              
              {/* Professional Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Your work and education details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="department"
                      name="department"
                      label="Department"
                      leftIcon={<Briefcase size={18} />}
                      value={isEditing ? tempProfile.department : profile.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                      fullWidth
                    />
                    
                    <Input
                      id="position"
                      name="position"
                      label="Position"
                      leftIcon={<Briefcase size={18} />}
                      value={isEditing ? tempProfile.position : profile.position}
                      onChange={handleChange}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Education
                    </label>
                    <div className="space-y-3">
                      {(isEditing ? tempProfile.education : profile.education).map((edu, index) => (
                        <div key={edu.id} className="p-3 bg-slate-50 rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{edu.degree}</p>
                              <p className="text-sm text-slate-600">{edu.institution}, {edu.year}</p>
                            </div>
                            {isEditing && (
                              <button 
                                className="text-red-500 p-1 hover:bg-red-50 rounded-md"
                                onClick={() => {
                                  const newEducation = [...tempProfile.education];
                                  newEducation.splice(index, 1);
                                  setTempProfile({...tempProfile, education: newEducation});
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isEditing && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newEdu = {
                              id: `edu-${Date.now()}`,
                              degree: 'New Degree',
                              institution: 'Institution Name',
                              year: '2023'
                            };
                            setTempProfile({
                              ...tempProfile,
                              education: [...tempProfile.education, newEdu]
                            });
                          }}
                        >
                          Add Education
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(isEditing ? tempProfile.skills : profile.skills).map(skill => (
                        <div 
                          key={skill} 
                          className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700 flex items-center"
                        >
                          <span>{skill}</span>
                          {isEditing && (
                            <button 
                              className="ml-1.5 text-slate-500 hover:text-red-500"
                              onClick={() => removeSkill(skill)}
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {isEditing && (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Add a skill"
                          className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              addSkill(input.value);
                              input.value = '';
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                            addSkill(input.value);
                            input.value = '';
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Learning Achievements Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Achievements</CardTitle>
                  <CardDescription>Your progress and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center mb-2">
                        <GraduationCap size={20} className="text-blue-600 mr-2" />
                        <h4 className="font-medium">Completed Courses</h4>
                      </div>
                      <p className="text-2xl font-bold">4</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center mb-2">
                        <Award size={20} className="text-amber-600 mr-2" />
                        <h4 className="font-medium">Certifications</h4>
                      </div>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center mb-2">
                        <Clock size={20} className="text-green-600 mr-2" />
                        <h4 className="font-medium">Learning Hours</h4>
                      </div>
                      <p className="text-2xl font-bold">14.5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-slate-900">Email Notifications</h4>
                      <p className="text-sm text-slate-600">Receive course updates, assignment reminders, and announcements</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        id="emailNotifications"
                        name="emailNotifications"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        checked={isEditing ? tempProfile.preferences.emailNotifications : profile.preferences.emailNotifications}
                        onChange={handlePreferenceChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-slate-900">SMS Notifications</h4>
                      <p className="text-sm text-slate-600">Receive urgent updates and alerts via text message</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        id="smsNotifications"
                        name="smsNotifications"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        checked={isEditing ? tempProfile.preferences.smsNotifications : profile.preferences.smsNotifications}
                        onChange={handlePreferenceChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-slate-900">Learning Reminders</h4>
                      <p className="text-sm text-slate-600">Receive reminders to continue your learning journey</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        id="learningReminders"
                        name="learningReminders"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        checked={isEditing ? tempProfile.preferences.learningReminders : profile.preferences.learningReminders}
                        onChange={handlePreferenceChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-slate-900">Weekly Learning Digest</h4>
                      <p className="text-sm text-slate-600">Receive a weekly summary of your progress and new courses</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        id="weeklyDigest"
                        name="weeklyDigest"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        checked={isEditing ? tempProfile.preferences.weeklyDigest : profile.preferences.weeklyDigest}
                        onChange={handlePreferenceChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div>
                      <h4 className="text-base font-medium text-slate-900">Password</h4>
                      <p className="text-sm text-slate-600">Last changed {profile.security.lastPasswordChange}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleChangePassword}
                    >
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div>
                      <h4 className="text-base font-medium text-slate-900">Multi-Factor Authentication</h4>
                      <p className="text-sm text-slate-600">{profile.security.mfaEnabled ? 'Enabled' : 'Not enabled'}</p>
                    </div>
                    {!profile.security.mfaEnabled ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEnableMFA}
                      >
                        Enable
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTempProfile({
                            ...tempProfile,
                            security: {
                              ...tempProfile.security,
                              mfaEnabled: false
                            }
                          });
                        }}
                      >
                        Disable
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-medium text-slate-900">Login Alerts</h4>
                      <p className="text-sm text-slate-600">Get notified of new sign-ins to your account</p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        id="loginAlerts"
                        name="loginAlerts"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        checked={isEditing ? tempProfile.security.loginAlerts : profile.security.loginAlerts}
                        onChange={handleSecurityChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={cancelEditing}
              >
                Cancel
              </Button>
              <Button
                onClick={saveChanges}
                isLoading={isLoading}
                leftIcon={<Save size={18} />}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;