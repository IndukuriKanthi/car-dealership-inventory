import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-gray-900">Car Dealership Inventory — Admin</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Sign out
          </button>
        </div>
      </nav>
      <main className="p-6">
        <p className="text-gray-500">Admin panel — coming in Phase 12.</p>
      </main>
    </div>
  );
}
