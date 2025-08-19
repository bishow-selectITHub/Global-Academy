import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toaster';
import { useDispatch } from 'react-redux';
import { rootLogout } from '../store/index';

export type UserRole = 'superadmin' | 'learner' | 'admin' | 'manager' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    extras?: {
      registrationNo?: string;
      companyName?: string;
      domain?: string;
      companyStamp?: string;
      companyDoc?: string;
      phone?: string;
      location?: string;
    }
  ) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          setIsLoading(false);
          return;
        }

        if (sessionData?.session) {
          const { data: userData } = await supabase.auth.getUser();

          if (userData?.user) {
            let role: UserRole = 'superadmin'; // Default role

            if (userData.user.user_metadata?.role) {
              role = userData.user.user_metadata.role as UserRole;
            } else {
              // Check the user_roles table as fallback
              try {
                const { data: roleData } = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', userData.user.id)
                  .single();

                if (roleData?.role) {
                  role = roleData.role as UserRole;
                }
              } catch (error) {
                console.log('Error fetching role from user_roles table:', error);
              }
            }

            setUser({
              id: userData.user.id,
              email: userData.user.email || '',
              role: role,
              avatar: userData.user.user_metadata?.avatar || '',
              name: userData.user.user_metadata?.name || ''
            });
          }
        }
      } catch (err) {
        console.error('Error in fetchUser:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Sign in with Supabase
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.session) {
        throw signInError || new Error('Login failed');
      }

      const userId = signInData.user.id;

      // Fetch role from user_roles table
      let role: UserRole = 'learner';
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) {
        console.warn('Could not fetch user role, defaulting to learner:', roleError.message);
      } else if (roleData?.role) {
        role = roleData.role as UserRole;
      }

      setUser({
        id: userId,
        name: signInData.user.user_metadata?.name || '',
        email: signInData.user.email || '',
        role,
        avatar: signInData.user.user_metadata?.avatar || '',
      });

      // Navigate based on role
      if (role === 'superadmin' || role === 'admin' || role === 'manager') {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      // Optimistic logout - clear user state immediately
      setUser(null);
      dispatch(rootLogout()); // Clear all Redux state

      // Navigate immediately for better UX
      navigate('/login');

      // Sign out from Supabase in background
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        addToast({
          title: "Error signing out",
          message: error.message,
          type: "error"
        });
        return;
      }

      addToast({
        title: "Signed out successfully",
        message: 'You have been logged out',
        type: 'success'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      addToast({
        title: "Logout error",
        message: "An error occurred during logout",
        type: "error"
      });
    }
  }, [addToast, navigate, dispatch]);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    extras?: {
      registrationNo?: string;
      companyName?: string;
      domain?: string;
      companyStamp?: string;
      companyDoc?: string;
      phone?: string;
      location?: string;
    }
  ) => {
    setIsLoading(true);
    try {
      // Sign up with Supabase (store name in user_metadata)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'superadmin',
            registrationNo: extras?.registrationNo || '',
            companyName: extras?.companyName || '',
            domain: extras?.domain || '',
            companyStamp: extras?.companyStamp || '',
            companyDoc: extras?.companyDoc || '',
            phone: extras?.phone || '',
            location: extras?.location || ''
          }
        }
      });

      if (signUpError || !signUpData.user) {
        throw signUpError || new Error('Registration failed');
      }

      // Insert role into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: signUpData.user.id, role: 'superadmin' }]);

      if (roleError) {
        throw roleError;
      }

      // Create a profile entry in the 'users' table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id,
          name: name,
          email: email,
          phone: extras?.phone || '',
          location: extras?.location || '',

          registrationNo: extras?.registrationNo || '',
          companyName: extras?.companyName || '',
          domain: extras?.domain || '',
          companyStamp: extras?.companyStamp || '',
          companyDoc: extras?.companyDoc || ''
        });

      if (profileError) {
        throw profileError;
      }

      addToast({
        title: "Registration successful",
        message: "Please check your email to confirm your account, then log in.",
        type: "success"
      });

      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      addToast({
        title: "Registration error",
        message: "An error occurred.",
        type: "error"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addToast, navigate]);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'manager'
  }), [user, isLoading, login, logout, register]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};