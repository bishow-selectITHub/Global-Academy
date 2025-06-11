import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useUser } from '../../contexts/UserContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useUser();

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      // Navigation will happen automatically via AuthLayout
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        email: 'This email may already be in use',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          type="text"
          label="Full Name"
          leftIcon={<User size={18} />}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          fullWidth
          autoComplete="name"
        />

        <Input
          id="email"
          type="email"
          label="Email Address"
          leftIcon={<Mail size={18} />}
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          fullWidth
          autoComplete="email"
        />

        <Input
          id="password"
          type="password"
          label="Password"
          leftIcon={<Lock size={18} />}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          helperText="Password must be at least 8 characters"
          fullWidth
          autoComplete="new-password"
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          leftIcon={<Lock size={18} />}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          fullWidth
          autoComplete="new-password"
        />

        <div className="mt-4">
          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Account
          </Button>
        </div>

        <div className="mt-4 text-sm text-center text-slate-600">
          By creating an account, you agree to the{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            Privacy Policy
          </a>
        </div>
      </form>
    </div>
  );
};

export default Register;