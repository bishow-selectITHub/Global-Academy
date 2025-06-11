import { useState, useEffect, useRef } from 'react';
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
  Save,
  Clock,
  Camera
} from 'lucide-react';
import { useUser } from '../../../contexts/UserContext';
import { useToast } from '../../../components/ui/Toaster';
import { supabase } from '../../../lib/supabase';

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  department: string;
  position: string;
  bio: string;
  education: Education[];
  skills: string[];
}

const DEFAULT_SKILLS = ['Project Management', 'Leadership', 'Communication', 'Teamwork', 'Problem Solving'];

const MyProfile = () => {
  const { user } = useUser();
  const { addToast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, email, phone, location, avatar, department, position, bio, education, skills')
          .eq('id', user.id)
          .single();

          console.log(data);

        if (error) {
          throw error;
        }

        if (data) {
          const parsedEducation = data.education ? JSON.parse(data.education) : [];
          const parsedSkills = data.skills ? JSON.parse(data.skills) : [];

          const profileData: UserProfile = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
            avatar: data.avatar || '',
            department: data.department || '',
            position: data.position || '',
            bio: data.bio || '',
            education: parsedEducation,
            skills: parsedSkills,
          };
          setProfile(profileData);
          setTempProfile(profileData);
        }
      } catch (error: any) {
        addToast({
          type: 'error',
          title: 'Error fetching profile',
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, addToast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setTempProfile(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };
  
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !tempProfile || !event.target.files || event.target.files.length === 0) {
      return;
    }

    setIsLoading(true);
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('user-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('user-assets')
        .getPublicUrl(filePath);
      
      if (publicUrlData) {
        const avatarUrl = publicUrlData.publicUrl;
        console.log('Uploaded avatar public URL:', avatarUrl);
        
        // Update the avatar URL in the users table immediately
        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar: avatarUrl })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        // Update the local state
        setTempProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
        setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
        
        addToast({
          type: 'success',
          title: 'Avatar uploaded',
          message: 'Your avatar has been updated.',
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const saveChanges = async () => {
    if (!user || !tempProfile) return;
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: tempProfile.name,
          phone: tempProfile.phone,
          location: tempProfile.location,
          avatar: tempProfile.avatar || '',
          department: tempProfile.department,
          position: tempProfile.position,
          bio: tempProfile.bio,
          education: JSON.stringify(tempProfile.education),
          skills: JSON.stringify(tempProfile.skills),
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setProfile(tempProfile);
      setIsEditing(false);
      
      addToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your changes have been saved successfully',
      });
    } catch (error: any) {
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
  
  const cancelEditing = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };
  
  const addSkill = (newSkill: string) => {
    if (newSkill && tempProfile && !tempProfile.skills.includes(newSkill)) {
      setTempProfile(prev => prev ? ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }) : null);
    }
  };
  
  const removeSkill = (skillToRemove: string) => {
    setTempProfile(prev => prev ? ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }) : null);
  };

  const handleEducationChange = (id: string, field: string, value: string) => {
    setTempProfile(prev => prev ? {
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    } : null);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 h-96 bg-slate-200 rounded-lg"></div>
          <div className="md:col-span-3 h-96 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!profile || !tempProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile not found</h2>
        <p className="text-slate-600 mb-6">Please ensure you are logged in or your profile exists.</p>
      </div>
    );
  }
  
  console.log('Avatar URL being rendered:', tempProfile.avatar);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600">
          Manage your account information and preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-blue-100">
                        <img
      key={tempProfile.avatar || 'placeholder'}
      src={tempProfile.avatar || profile.avatar}
      alt={profile.name}
      className="w-full h-full object-cover object-top"
    />
                  </div>
                  {isEditing && (
                    <label 
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition"
                    >
                      <Camera size={14} />
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                      />
                    </label>
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
                </nav>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="space-y-6">
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
                      disabled={true}
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
                      {(isEditing ? tempProfile.education : profile.education).map(edu => (
                        <div key={edu.id} className="p-3 bg-slate-50 rounded-md">
                          <div className="flex justify-between items-start">
                            {isEditing ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                <Input
                                  id={`degree-${edu.id}`}
                                  name="degree"
                                  label="Degree"
                                  value={edu.degree}
                                  onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                                  fullWidth
                                />
                                <Input
                                  id={`institution-${edu.id}`}
                                  name="institution"
                                  label="Institution"
                                  value={edu.institution}
                                  onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                                  fullWidth
                                />
                                <Input
                                  id={`year-${edu.id}`}
                                  name="year"
                                  label="Year"
                                  value={edu.year}
                                  onChange={(e) => handleEducationChange(edu.id, 'year', e.target.value)}
                                  fullWidth
                                />
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium">{edu.degree}</p>
                                <p className="text-sm text-slate-600">{edu.institution}, {edu.year}</p>
                              </div>
                            )}
                            {isEditing && (
                              <button 
                                className="text-red-500 p-1 hover:bg-red-50 rounded-md"
                                onClick={() => {
                                  const newEducation = tempProfile.education.filter(item => item.id !== edu.id);
                                  setTempProfile(prev => prev ? ({...prev, education: newEducation}) : null);
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
                            setTempProfile(prev => prev ? ({
                              ...prev,
                              education: [...prev.education, newEdu]
                            }) : null);
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
                      <div className="space-y-4">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Add a new skill (e.g., 'Project Management')"
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

                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Choose from popular skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {DEFAULT_SKILLS.map(skill => (
                              <Button
                                key={skill}
                                variant="outline"
                                size="sm"
                                onClick={() => addSkill(skill)}
                                disabled={tempProfile.skills.includes(skill)}
                              >
                                {skill}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
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