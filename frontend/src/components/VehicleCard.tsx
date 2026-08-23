import { useState } from 'react';
import type { Vehicle } from '../types';
import { vehicleApi } from '../services/vehicleApi';
import { ApiRequestError } from '../services/apiClient';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchased: (updated: Vehicle) => void;
}

export default function VehicleCard({ vehicle, onPurchased }: VehicleCardProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const outOfStock = vehicle.quantity === 0;

  async function handlePurchase() {
    setPurchasing(true);
    setFeedback(null);
    try {
      const res = await vehicleApi.purchase(vehicle.id);
      onPurchased(res.data.vehicle);
      setFeedback({ type: 'success', message: 'Purchase successful!' });
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Purchase failed.';
      setFeedback({ type: 'error', message });
    } finally {
      setPurchasing(false);
    }
  }

  const price = Number(vehicle.price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-5 gap-3">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-gray-900 text-base leading-tight">
          {vehicle.make} {vehicle.model}
        </h3>
        <span className="inline-block mt-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
          {vehicle.category}
        </span>
      </div>

      {/* Price */}
      <p className="text-2xl font-bold text-gray-900">{price}</p>

      {/* Stock */}
      <div className="flex items-center gap-1.5">
        {outOfStock ? (
          <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
            Out of Stock
          </span>
        ) : (
          <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
            {vehicle.quantity} in stock
          </span>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <p
          role="status"
          className={`text-xs rounded-lg px-3 py-2 ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {feedback.message}
        </p>
      )}

      {/* Purchase button */}
      <button
        onClick={handlePurchase}
        disabled={outOfStock || purchasing}
        className="mt-auto w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors
          bg-blue-600 text-white hover:bg-blue-700
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        {purchasing ? 'Processing…' : outOfStock ? 'Out of Stock' : 'Purchase'}
      </button>
    </div>
  );
}
