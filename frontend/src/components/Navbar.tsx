import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="font-semibold text-gray-900 text-base">{title}</span>
        <div className="flex items-center gap-4">
          {isAdmin && pathname !== '/admin' && (
            <Link to="/admin" className="text-sm font-medium text-blue-600 hover:underline">
              Admin
            </Link>
          )}
          {pathname !== '/dashboard' && (
            <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
              Dashboard
            </Link>
          )}
          <span className="text-sm text-gray-500 hidden sm:inline">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline focus:outline-none focus:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
