import { Table, Guest } from '@/types';
import { guests } from '@/data/guests';

interface Props {
  tables: Table[];
  guests?: Guest[];
  highlightId?: number;
  onTableClick?: (tableId: number) => void;
}

export default function TablePlan({ tables, guests: guestsProps, highlightId, onTableClick }: Props) {
  return (
    <div className="w-full grid
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                    gap-4 p-4
                    bg-white-200
                    rounded shadow overflow-auto">
      {tables.map(table => {
        // Si les invités sont passés en props, les utiliser, sinon utiliser ceux de la table ou les données statiques
        const guestsToUse = guestsProps || guests;
        const people = table.guests || guestsToUse.filter((g: Guest) => g.tableId === table.id);
        const capacity = table.capacity || 8; // Capacité par défaut si non définie
        const occupancy = people.length;
        const isOverCapacity = occupancy > capacity;
        const isFull = occupancy === capacity;
        
        return (
          <div
            key={table.id}
            id={highlightId === table.id ? `table-${table.id}` : undefined}
            onClick={() => onTableClick?.(table.id)}
            className={`
              w-full h-48 p-4 rounded-lg flex flex-col items-center justify-center text-sm
              ${onTableClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
              ${highlightId === table.id
                ? 'bg-blue-200 border-2 border-blue-500 text-black'
                : isOverCapacity 
                  ? 'bg-red-100 border-2 border-red-300'
                  : isFull
                    ? 'bg-yellow-100 border-2 border-yellow-300'
                    : 'bg-green-100 border-2 border-green-300'}
              shadow
            `}
          >
            <div className="font-bold mb-2 text-base">{table.name}</div>
            <div className={`text-xs mb-2 px-2 py-1 rounded-full ${
              isOverCapacity 
                ? 'bg-red-200 text-red-800'
                : isFull
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-green-200 text-green-800'
            }`}>
              {occupancy}/{capacity} places
            </div>
            <div className="flex-1 overflow-auto w-full">
              {people.map((p: Guest) => (
                <div key={p.id} className="text-xs text-center truncate">
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
