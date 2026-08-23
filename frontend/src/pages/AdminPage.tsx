import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleApi } from '../services/vehicleApi';
import { ApiRequestError } from '../services/apiClient';
import type { Vehicle, CreateVehicleRequest } from '../types';
import Navbar from '../components/Navbar';
import VehicleForm from '../components/VehicleForm';
import RestockForm from '../components/RestockForm';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';

type Panel = 'add' | { type: 'edit'; vehicle: Vehicle } | { type: 'restock'; vehicle: Vehicle } | null;

export default function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState<Panel>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vehicleApi.getAll();
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
  }, [logout, navigate]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  async function handleAdd(data: CreateVehicleRequest) {
    const res = await vehicleApi.create(data);
    setVehicles((prev) => [res.data.vehicle, ...prev]);
    setPanel(null);
    setToast('Vehicle added.');
  }

  async function handleEdit(data: CreateVehicleRequest) {
    if (typeof panel !== 'object' || panel === null || panel.type !== 'edit') return;
    const res = await vehicleApi.update(panel.vehicle.id, data);
    setVehicles((prev) => prev.map((v) => (v.id === res.data.vehicle.id ? res.data.vehicle : v)));
    setPanel(null);
    setToast('Vehicle updated.');
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vehicleApi.delete(deleteTarget.id);
      setVehicles((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
      setToast('Vehicle deleted.');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Delete failed.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleRestock(quantity: number) {
    if (typeof panel !== 'object' || panel === null || panel.type !== 'restock') return;
    const res = await vehicleApi.restock(panel.vehicle.id, { quantity });
    setVehicles((prev) => prev.map((v) => (v.id === res.data.vehicle.id ? res.data.vehicle : v)));
    setPanel(null);
    setToast('Inventory restocked.');
  }

  const price = (v: Vehicle) =>
    Number(v.price).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Car Dealership — Admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Inventory Management</h1>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-0.5">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {panel === null && (
            <button
              onClick={() => setPanel('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              + Add Vehicle
            </button>
          )}
        </div>

        {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
        {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

        {panel === 'add' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm animate-fade-in">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Add Vehicle</h2>
            <VehicleForm onSubmit={handleAdd} onCancel={() => setPanel(null)} submitLabel="Add Vehicle" />
          </div>
        )}

        {typeof panel === 'object' && panel !== null && panel.type === 'edit' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm animate-fade-in">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Edit — {panel.vehicle.make} {panel.vehicle.model}
            </h2>
            <VehicleForm
              initial={panel.vehicle}
              onSubmit={handleEdit}
              onCancel={() => setPanel(null)}
              submitLabel="Save Changes"
            />
          </div>
        )}

        {typeof panel === 'object' && panel !== null && panel.type === 'restock' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm animate-fade-in">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Restock</h2>
            <RestockForm
              vehicleName={`${panel.vehicle.make} ${panel.vehicle.model}`}
              onSubmit={handleRestock}
              onCancel={() => setPanel(null)}
            />
          </div>
        )}

        {loading && <LoadingSpinner />}
        {!loading && !error && vehicles.length === 0 && <EmptyState message="No vehicles in inventory." />}
        {!loading && vehicles.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {v.make} {v.model}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{v.category}</td>
                      <td className="px-4 py-3 text-gray-700">{price(v)}</td>
                      <td className="px-4 py-3">
                        {v.quantity === 0 ? (
                          <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                            {v.quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPanel({ type: 'restock', vehicle: v })}
                            className="text-xs text-green-700 hover:underline font-medium focus:outline-none focus:underline"
                          >
                            Restock
                          </button>
                          <button
                            onClick={() => setPanel({ type: 'edit', vehicle: v })}
                            className="text-xs text-blue-600 hover:underline font-medium focus:outline-none focus:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(v)}
                            className="text-xs text-red-600 hover:underline font-medium focus:outline-none focus:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.make} ${deleteTarget.model}"? This cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
