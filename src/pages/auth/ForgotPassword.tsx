import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Home } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // In a real app, this would call a password reset function
      // For the demo, we'll just simulate a successful request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({
        email: 'There was an error processing your request',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-600 mb-6">
          We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
        </p>
        <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center relative">
        <Link
          to="/"
          className="absolute left-0 top-0 p-2 rounded-md hover:bg-slate-100 transition-colors"
          title="Home"
        >
          <Home size={20} className="text-slate-600 hover:text-slate-800" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Reset your password</h2>
        <p className="mt-2 text-sm text-slate-600">
          We'll email you a link to reset your password
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
          autoComplete="email"
        />

        <div>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Send reset link
          </Button>
        </div>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;