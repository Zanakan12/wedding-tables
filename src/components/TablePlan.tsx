import { Table, Guest } from '@/types';
import { guests } from '@/data/guests';

interface Props {
  tables: Table[];
  highlightId?: number;
}

export default function TablePlan({ tables, highlightId }: Props) {
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
        // Si la table a des invités inclus (depuis l'API), les utiliser
        // Sinon, filtrer depuis les données statiques
        const people = table.guests || guests.filter((g: Guest) => g.tableId === table.id);
        return (
          <div
            key={table.id}
            id={highlightId === table.id ? `table-${table.id}` : undefined}
            className={`
              w-full h-48 p-4 rounded-lg flex flex-col items-center justify-center text-sm
              ${highlightId === table.id
                ? 'bg-gray-500 text-black'
                : 'bg-gray-300'}
              shadow
            `}
          >
            <div className="font-bold mb-2 text-base">{table.name}</div>
            {people.map((p: Guest) => <div key={p.id}>{p.name}</div>)}
          </div>
        );
      })}
    </div>
  );
}
