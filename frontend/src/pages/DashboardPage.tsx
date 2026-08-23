import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleApi } from '../services/vehicleApi';
import { ApiRequestError } from '../services/apiClient';
import type { Vehicle, VehicleSearchParams } from '../types';
import Navbar from '../components/Navbar';
import VehicleGrid from '../components/VehicleGrid';
import SearchFilters from '../components/SearchFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilters, setActiveFilters] = useState<VehicleSearchParams | null>(null);
  const [toast, setToast] = useState('');

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

  function handlePurchased(updated: Vehicle) {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    setToast('Purchase successful!');
  }

  const isFiltered = activeFilters !== null && Object.keys(activeFilters).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Car Dealership Inventory" />

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

        {toast && <Toast message={toast} onDismiss={() => setToast('')} />}

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
