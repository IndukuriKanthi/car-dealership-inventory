import type { Vehicle } from '../types';
import VehicleCard from './VehicleCard';

interface VehicleGridProps {
  vehicles: Vehicle[];
  onPurchased: (updated: Vehicle) => void;
}

export default function VehicleGrid({ vehicles, onPurchased }: VehicleGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} onPurchased={onPurchased} />
      ))}
    </div>
  );
}
