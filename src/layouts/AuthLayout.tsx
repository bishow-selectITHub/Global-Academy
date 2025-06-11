import { ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const AuthLayout = () => {
  const { isAuthenticated, isAdmin } = useUser();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col sm:flex-row">
        {/* Brand section (left on desktop, top on mobile) */}
        <div className="bg-blue-900 text-white sm:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <div className="flex items-center mb-8">
              <img
                src="https://via.placeholder.com/60x60.png?text=GS"
                alt="GlobalSelect Academy"
                className="h-14 w-14 mr-4"
              />
              <h1 className="text-3xl font-bold">GlobalSelect Academy</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Empowering Your Learning Journey</h2>
            <p className="text-blue-100 mb-6">
              Access comprehensive courses, track your progress, and earn certifications
              that advance your career. GlobalSelect Academy is your partner in professional development.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-10">
              <div className="bg-blue-800 p-4 rounded-lg">
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-blue-200 text-sm">Specialized Courses</div>
              </div>
              <div className="bg-blue-800 p-4 rounded-lg">
                <div className="text-3xl font-bold mb-2">10k+</div>
                <div className="text-blue-200 text-sm">Active Learners</div>
              </div>
              <div className="bg-blue-800 p-4 rounded-lg">
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-blue-200 text-sm">Completion Rate</div>
              </div>
              <div className="bg-blue-800 p-4 rounded-lg">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-blue-200 text-sm">Learning Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth form section */}
        <div className="sm:w-1/2 flex justify-center items-center p-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;