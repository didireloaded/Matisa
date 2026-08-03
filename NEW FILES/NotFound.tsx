// src/pages/NotFound.tsx
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6">
        <span className="text-white/20 text-3xl font-bold">404</span>
      </div>
      <h1 className="text-white text-xl font-bold mb-2">Page not found</h1>
      <p className="text-white/40 text-sm text-center mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00D9C0] to-[#00B4D8] rounded-full text-black font-semibold text-sm"
      >
        <Home className="w-4 h-4" />
        Go Home
      </button>
    </div>
  );
}
