import { Table } from '@/types';
import { guests } from '@/data/guests';
import Link from 'next/link';
import { Guest } from '@/types';

interface Props {
  tables: Table[];
  highlightId?: number;
  result: Guest | null;
}

export default function TablePlan({ tables, highlightId, result }: Props) {
  return (
    <div className="w-full grid
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                    gap-4 p-4
                    bg-pink-200
                    rounded shadow overflow-auto">
      {tables.map(table => {
        const people = guests.filter(g => g.tableId === table.id);
        return (
          <div
            key={table.id}
            className={`
              w-full h-48 p-4 rounded-lg flex flex-col items-center justify-center text-sm
              ${highlightId === table.id
                ? 'bg-pink-500 text-white'
                : 'bg-pink-300'}
              shadow
            `}
          >
            <div id={`${table.id}`} className="font-bold mb-2 text-base">{table.name}</div>
            {people.map(p => <div key={p.id}>{p.name}</div>)}

            {highlightId === table.id && result && (
              <Link
                href={`/disposition/${table.id}`}
                className="mt-2 inline-block bg-pink-300 hover:bg-pink-600 text-white px-4 py-2 rounded "
              >
                Voir la disposition
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
