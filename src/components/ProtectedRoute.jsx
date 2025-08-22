// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3c23d]/10 to-[#bc7b13]/10">
        <div className="glass-honey rounded-2xl p-8 border border-white/30 backdrop-blur-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f37623] mx-auto mb-4"></div>
          <p className="text-[#bc7b13] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3c23d]/10 to-[#bc7b13]/10">
        <div className="glass-honey rounded-2xl p-8 border border-white/30 backdrop-blur-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#f37623] text-white px-6 py-3 rounded-xl hover:bg-[#bc7b13] transition-colors duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};