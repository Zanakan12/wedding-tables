// src/app/page.tsx
'use client';

import { useState } from 'react';
import TablePlan from '@/components/TablePlan';
import { Guest } from '@/types';
import { guests } from '@/data/guests';
import { tables } from '@/data/tables';

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Guest | null>(null);
  const bgUrl = 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  const handleSearch = () => {
  const guest = guests.find(g => g.name.toLowerCase().includes(query.toLowerCase()));
  setResult(guest || null);

  // scroll automatique si on trouve l'invité
  if (guest) {
    setTimeout(() => {
      const element = document.getElementById(String(guest.tableId));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100); // petit délai pour s'assurer que la table est rendue
  }
};


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

        {result ? (
        <>
          <p className="mt-4">🪑 {result.name} est à la table {result.tableId}</p>
        </>
        ) : query && (
          <p className="mt-4 text-red-300">Aucun invité trouvé.</p>
        )}

        <TablePlan tables={tables} highlightId={result?.tableId} result={result}/>
      </div>
    </main>
  );
}
