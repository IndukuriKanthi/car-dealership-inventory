import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleApi } from '../services/vehicleApi';
import { ApiRequestError } from '../services/apiClient';
import type { Vehicle, VehicleSearchParams } from '../types';
import VehicleGrid from '../components/VehicleGrid';
import SearchFilters from '../components/SearchFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // null = show all; object = active search filters
  const [activeFilters, setActiveFilters] = useState<VehicleSearchParams | null>(null);

  const loadVehicles = useCallback(
    async (filters: VehicleSearchParams | null) => {
      setLoading(true);
      setError('');
      try {
        const res =
          filters && Object.keys(filters).length > 0
            ? await vehicleApi.search(filters)
            : await vehicleApi.getAll();
        setVehicles(res.data.vehicles);
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        setError(err instanceof ApiRequestError ? err.message : 'Failed to load vehicles.');
      } finally {
        setLoading(false);
      }
    },
    [logout, navigate],
  );

  useEffect(() => {
    loadVehicles(activeFilters);
  }, [loadVehicles, activeFilters]);

  function handleSearch(params: VehicleSearchParams) {
    setActiveFilters(params);
  }

  function handleReset() {
    setActiveFilters(null);
  }

  // Replace the updated vehicle in local state — no full reload needed
  function handlePurchased(updated: Vehicle) {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const isFiltered = activeFilters !== null && Object.keys(activeFilters).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-semibold text-gray-900 text-base">Car Dealership Inventory</span>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-blue-600 hover:underline">
                Admin
              </Link>
            )}
            <span className="text-sm text-gray-500 hidden sm:inline">{user?.name}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Vehicle Inventory</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-500 mt-0.5">
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
              {isFiltered ? ' matching filters' : ''}
            </p>
          )}
        </div>

        <SearchFilters onSearch={handleSearch} onReset={handleReset} loading={loading} />

        {loading && <LoadingSpinner />}
        {!loading && error && <ErrorMessage message={error} />}
        {!loading && !error && vehicles.length === 0 && (
          <EmptyState
            message={isFiltered ? 'No vehicles match your filters.' : 'No vehicles in inventory.'}
          />
        )}
        {!loading && !error && vehicles.length > 0 && (
          <VehicleGrid vehicles={vehicles} onPurchased={handlePurchased} />
        )}
      </main>
    </div>
  );
}
