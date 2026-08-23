import { useState, type FormEvent } from 'react';
import type { VehicleSearchParams } from '../types';

interface SearchFiltersProps {
  onSearch: (params: VehicleSearchParams) => void;
  onReset: () => void;
  loading: boolean;
}

const CATEGORIES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Electric', 'Hatchback', 'Convertible', 'Van'];

const empty = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

export default function SearchFilters({ onSearch, onReset, loading }: SearchFiltersProps) {
  const [fields, setFields] = useState(empty);
  const [priceError, setPriceError] = useState('');

  function set(key: keyof typeof empty, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (key === 'minPrice' || key === 'maxPrice') setPriceError('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const min = fields.minPrice !== '' ? Number(fields.minPrice) : undefined;
    const max = fields.maxPrice !== '' ? Number(fields.maxPrice) : undefined;

    if (min !== undefined && max !== undefined && min > max) {
      setPriceError('Min price cannot exceed max price.');
      return;
    }

    const params: VehicleSearchParams = {};
    if (fields.make.trim()) params.make = fields.make.trim();
    if (fields.model.trim()) params.model = fields.model.trim();
    if (fields.category) params.category = fields.category;
    if (min !== undefined) params.minPrice = min;
    if (max !== undefined) params.maxPrice = max;

    onSearch(params);
  }

  function handleReset() {
    setFields(empty);
    setPriceError('');
    onReset();
  }

  const hasFilters = Object.values(fields).some((v) => v !== '');

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Make */}
        <div>
          <label htmlFor="filter-make" className="block text-xs font-medium text-gray-600 mb-1">
            Make
          </label>
          <input
            id="filter-make"
            type="text"
            value={fields.make}
            onChange={(e) => set('make', e.target.value)}
            placeholder="e.g. Toyota"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Model */}
        <div>
          <label htmlFor="filter-model" className="block text-xs font-medium text-gray-600 mb-1">
            Model
          </label>
          <input
            id="filter-model"
            type="text"
            value={fields.model}
            onChange={(e) => set('model', e.target.value)}
            placeholder="e.g. Camry"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="filter-category" className="block text-xs font-medium text-gray-600 mb-1">
            Category
          </label>
          <select
            id="filter-category"
            value={fields.category}
            onChange={(e) => set('category', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Min price */}
        <div>
          <label htmlFor="filter-min-price" className="block text-xs font-medium text-gray-600 mb-1">
            Min price ($)
          </label>
          <input
            id="filter-min-price"
            type="number"
            min={0}
            value={fields.minPrice}
            onChange={(e) => set('minPrice', e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Max price */}
        <div>
          <label htmlFor="filter-max-price" className="block text-xs font-medium text-gray-600 mb-1">
            Max price ($)
          </label>
          <input
            id="filter-max-price"
            type="number"
            min={0}
            value={fields.maxPrice}
            onChange={(e) => set('maxPrice', e.target.value)}
            placeholder="Any"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Price validation error */}
      {priceError && (
        <p role="alert" className="mt-2 text-xs text-red-600">{priceError}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </form>
  );
}
