import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, Building2, Globe, Phone, MapPin, Hash, Stamp, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [companyStampFile, setCompanyStampFile] = useState<File | null>(null);
  const [companyDocumentFile, setCompanyDocumentFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    registrationNo?: string;
    companyName?: string;
    domain?: string;
    phone?: string;
    location?: string;
    companyStampFile?: string;
    companyDocumentFile?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useUser();

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      registrationNo?: string;
      companyName?: string;
      domain?: string;
      phone?: string;
      location?: string;
      companyStampFile?: string;
      companyDocumentFile?: string;
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

    if (!registrationNo) {
      newErrors.registrationNo = 'Registration number is required';
    }

    if (!companyName) {
      newErrors.companyName = 'Company name is required';
    }

    if (!domain) {
      newErrors.domain = 'Domain is required';
    } else if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(domain)) {
      newErrors.domain = 'Enter a valid domain (e.g., example.com)';
    }

    if (!phone) {
      newErrors.phone = 'Phone is required';
    }

    if (!location) {
      newErrors.location = 'Location is required';
    }

    if (!companyDocumentFile) {
      newErrors.companyDocumentFile = 'Company Document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Upload company stamp if provided
      let companyStampUrl: string | undefined = undefined;
      let companyDocumentUrl: string | undefined = undefined;
      if (companyStampFile) {
        try {
          const filePath = `stamps/${Date.now()}_${companyStampFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('company')
            .upload(filePath, companyStampFile, { upsert: true, contentType: companyStampFile.type });
          if (uploadError) {
            console.warn('Company stamp upload failed:', uploadError.message);
          } else {
            const { data } = supabase.storage.from('company').getPublicUrl(filePath);
            companyStampUrl = data.publicUrl;
          }
        } catch (e) {
          console.warn('Company stamp upload exception:', e);
        }
      }

      if (companyDocumentFile) {
        try {
          const filePath = `docs/${Date.now()}_${companyDocumentFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('company')
            .upload(filePath, companyDocumentFile, { upsert: true, contentType: companyDocumentFile.type });
          if (uploadError) {
            console.warn('Company document upload failed:', uploadError.message);
          } else {
            const { data } = supabase.storage.from('company').getPublicUrl(filePath);
            companyDocumentUrl = data.publicUrl;
          }
        } catch (e) {
          console.warn('Company document upload exception:', e);
        }
      }

      await register(name, email, password, {
        registrationNo,
        companyName,
        domain,
        companyStamp: companyStampUrl,
        phone,
        location,
        companyDoc: companyDocumentUrl,
      });
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
    <div className="w-full ">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white  rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                id="name"
                type="text"
                label="Full Name"
                leftIcon={<UserIcon size={18} />}
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                fullWidth
                autoComplete="name"
              />
            </div>
            <div className="md:col-span-2">
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
            </div>
            <Input
              id="password"
              type="password"
              label="Password"
              leftIcon={<Lock size={18} />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              helperText="At least 8 characters"
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
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="registrationNo"
              type="text"
              label="Registration No."
              className=' pl-2'
              placeholder="e.g., 123456-ABC"
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              error={errors.registrationNo}
              fullWidth
              autoComplete="off"
            />
            <Input
              id="companyName"
              type="text"
              label="Company Name"
              leftIcon={<Building2 size={18} />}
              placeholder="Your company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              error={errors.companyName}
              fullWidth
              autoComplete="organization"
            />
            <Input
              id="domain"
              type="text"
              label="Company Domain"
              leftIcon={<Globe size={18} />}
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              error={errors.domain}
              fullWidth
              autoComplete="off"
            />
            <Input
              id="phone"
              type="tel"
              label="Phone"
              leftIcon={<Phone size={18} />}
              placeholder="+1 555 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              fullWidth
              autoComplete="tel"
            />
            <div className="md:col-span-2">
              <Input
                id="location"
                type="text"
                label="Location"
                leftIcon={<MapPin size={18} />}
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={errors.location}
                fullWidth
                autoComplete="address-level2"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="companyStamp" className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Stamp</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    id="companyStamp"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCompanyStampFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-md p-1"
                  />
                  {errors.companyStampFile && (
                    <p className="mt-1 text-xs text-red-600">{errors.companyStampFile}</p>
                  )}
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-100 border border-slate-200">
                  <Stamp size={18} className="text-slate-600" />
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">PNG, JPG or WEBP</p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="companyDocument" className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Document</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    id="companyDocument"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setCompanyDocumentFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-300 rounded-md p-1"
                  />
                  {errors.companyDocumentFile && (
                    <p className="mt-1 text-xs text-red-600">{errors.companyDocumentFile}</p>
                  )}
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-100 border border-slate-200">
                  <FileText size={18} className="text-slate-600" />
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">PDF, PNG, JPG or WEBP</p>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <Button type="submit" fullWidth isLoading={isLoading}>
            Create Account
          </Button>
          <p className="mt-3 text-xs text-center text-slate-500">
            By creating an account, you agree to the
            <a href="#" className="mx-1 font-medium text-blue-600 hover:text-blue-500">Terms</a>
            and
            <a href="#" className="ml-1 font-medium text-blue-600 hover:text-blue-500">Privacy</a>.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;