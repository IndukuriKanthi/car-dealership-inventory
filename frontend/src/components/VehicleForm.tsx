import { useState, useEffect, type FormEvent } from 'react';
import type { Vehicle, CreateVehicleRequest } from '../types';

const CATEGORIES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Electric', 'Hatchback', 'Convertible', 'Van'];

interface VehicleFormProps {
  initial?: Vehicle;
  onSubmit: (data: CreateVehicleRequest) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const emptyFields = { make: '', model: '', category: '', price: '', quantity: '' };

export default function VehicleForm({ initial, onSubmit, onCancel, submitLabel }: VehicleFormProps) {
  const [fields, setFields] = useState(emptyFields);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setFields({
        make: initial.make,
        model: initial.model,
        category: initial.category,
        price: String(Number(initial.price)),
        quantity: String(initial.quantity),
      });
    }
  }, [initial]);

  function set(key: keyof typeof emptyFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string {
    if (!fields.make.trim()) return 'Make is required.';
    if (!fields.model.trim()) return 'Model is required.';
    if (!fields.category) return 'Category is required.';
    const price = Number(fields.price);
    if (!fields.price || isNaN(price) || price <= 0) return 'Price must be greater than 0.';
    const qty = Number(fields.quantity);
    if (fields.quantity === '' || isNaN(qty) || !Number.isInteger(qty) || qty < 0)
      return 'Quantity must be a non-negative integer.';
    return '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        make: fields.make.trim(),
        model: fields.model.trim(),
        category: fields.category,
        price: Number(fields.price),
        quantity: Number(fields.quantity),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vf-make" className="block text-xs font-medium text-gray-600 mb-1">Make</label>
          <input id="vf-make" type="text" value={fields.make} onChange={(e) => set('make', e.target.value)}
            placeholder="e.g. Toyota" className={inputClass} />
        </div>
        <div>
          <label htmlFor="vf-model" className="block text-xs font-medium text-gray-600 mb-1">Model</label>
          <input id="vf-model" type="text" value={fields.model} onChange={(e) => set('model', e.target.value)}
            placeholder="e.g. Camry" className={inputClass} />
        </div>
        <div>
          <label htmlFor="vf-category" className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select id="vf-category" value={fields.category} onChange={(e) => set('category', e.target.value)}
            className={`${inputClass} bg-white`}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="vf-price" className="block text-xs font-medium text-gray-600 mb-1">Price ($)</label>
          <input id="vf-price" type="number" min={0.01} step="0.01" value={fields.price}
            onChange={(e) => set('price', e.target.value)} placeholder="e.g. 25000" className={inputClass} />
        </div>
        <div>
          <label htmlFor="vf-qty" className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
          <input id="vf-qty" type="number" min={0} step={1} value={fields.quantity}
            onChange={(e) => set('quantity', e.target.value)} placeholder="e.g. 5" className={inputClass} />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors">
          {loading ? 'Saving…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-4 py-2">
          Cancel
        </button>
      </div>
    </form>
  );
}
