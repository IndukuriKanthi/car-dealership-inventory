import { useState, type FormEvent } from 'react';

interface RestockFormProps {
  vehicleName: string;
  onSubmit: (quantity: number) => Promise<void>;
  onCancel: () => void;
}

export default function RestockForm({ vehicleName, onSubmit, onCancel }: RestockFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const qty = Number(value);
    if (!value || isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      setError('Enter a positive whole number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit(qty);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restock failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <p className="text-sm text-gray-600">
        Restock <span className="font-medium text-gray-900">{vehicleName}</span>
      </p>
      <div>
        <label htmlFor="restock-qty" className="block text-xs font-medium text-gray-600 mb-1">
          Quantity to add
        </label>
        <input
          id="restock-qty"
          type="number"
          min={1}
          step={1}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          placeholder="e.g. 10"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">{error}</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors">
          {loading ? 'Restocking…' : 'Restock'}
        </button>
        <button type="button" onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-4 py-2">
          Cancel
        </button>
      </div>
    </form>
  );
}
