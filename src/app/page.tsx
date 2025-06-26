'use client';

import { useState, useRef, useEffect } from 'react';
import TablePlan from '@/components/TablePlan';
import { Guest } from '@/types';
import { guests } from '@/data/guests';
import { tables } from '@/data/tables';

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Guest | null>(null);
  const tableRef = useRef<HTMLDivElement>(null); // Référence au composant TablePlan
  const bgUrl = 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  const handleSearch = () => {
    const guest = guests.find(g => g.name.toLowerCase().includes(query.toLowerCase()));
    setResult(guest || null);
  };

  useEffect(() => {
    if (result && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  return (
    <main className="relative flex flex-col items-center min-h-screen overflow-x-hidden px-4 py-8">
      {/* arrière-plan flouté */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />

      {/* contenu centré */}
      <div className="relative z-10 p-4 text-white flex flex-col items-center space-y-4 bg-pink-300 rounded">
        <h1 className="text-xl font-bold text-white">CHERCHER VOTRE PLACE</h1>

        <div className="flex space-x-2">
          <input
            type="text"
            className="border px-3 py-2 text-white rounded"
            placeholder="Nom"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="bg-pink-400 hover:bg-pink-600 px-4 py-2 rounded text-white"
          >
            Rechercher
          </button>
        </div>

        {result && (<p>🪑 {result.name} est à la table {result.tableId}</p>)}
            
        <div ref={tableRef}>
          <TablePlan tables={tables} highlightId={result?.tableId} />
        </div>
      </div>
    </main>
  );
}
