import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useUser } from '../../contexts/UserContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Navigation will happen automatically via AuthLayout
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        email: 'Invalid email or password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          className='p-2'
          autoComplete="email"
        />

        <Input
          id="password"
          type="password"
          className='p-2'
          label="Password"
          leftIcon={<Lock size={18} />}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          fullWidth
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign in
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">
              Sample Accounts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@globalselect.com');
              setPassword('password');
            }}
            className="p-2 border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('learner@globalselect.com');
              setPassword('password');
            }}
            className="p-2 border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Learner Demo
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;