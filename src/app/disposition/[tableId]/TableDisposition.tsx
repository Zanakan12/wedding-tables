'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { tables as initialTables } from '@/data/tables';
import { guests } from '@/data/guests';
import { Guest, Table } from '@/types';

interface Props {
  tableId: number;
}

export default function TableDisposition({ tableId }: Props) {
  const router = useRouter();
  const [tables] = useState<Table[]>(initialTables);
  const [positions, setPositions] = useState(() =>
    Object.fromEntries(initialTables.map(t => [t.id, { x: t.x, y: t.y }]))
  );

  const table = tables.find(t => t.id === tableId) || null;
  const [people, setPeople] = useState<Guest[]>([]);

  useEffect(() => {
    if (!table) {
      router.replace('/');
    } else {
      setPeople(guests.filter(g => g.tableId === table.id));
    }
  }, [table, router]);

  const handleDrag = (id: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = positions[id].x;
    const origY = positions[id].y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setPositions(prev => ({
        ...prev,
        [id]: { x: origX + dx, y: origY + dy }
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <main className="relative flex flex-col items-center min-h-screen overflow-x-hidden px-4 py-8 bg-gray-100">
      {/* arrière-plan flouté */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}
      />

      <div className="relative z-10 w-full max-w-5xl bg-white bg-opacity-90 rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{table?.name || 'Table inconnue'}</h1>
          <Link href="/" className="text-pink-600 hover:underline">← Accueil</Link>
        </div>
        <p className="text-lg">
          {table ? `${people.length} place${people.length > 1 ? 's' : ''}` : ''}
        </p>

        <div className="w-full h-[800px] relative bg-pink-200 rounded shadow overflow-auto p-4">
          {tables.map(t => {
            const pos = positions[t.id];
            const peopleAtTable = guests.filter(g => g.tableId === t.id);
            const isActive = t.id === table?.id;

            return (
              <div
                key={t.id}
                onMouseDown={e => handleDrag(t.id, e)}
                className={`
                  absolute cursor-move w-18 h-18 p-4 rounded-full flex flex-col items-center justify-center text-sm
                  ${isActive ? 'bg-pink-500 text-white' : 'bg-pink-300'}
                  shadow transition-all duration-150
                `}
                style={{ left: pos.x, top: pos.y }}
              >
                <div className="font-bold mb-2 text-base text-center">{t.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
