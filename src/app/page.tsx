'use client';

import { useState, useRef, useEffect } from 'react';
import TablePlan from '@/components/TablePlan';
import { Guest, Table } from '@/types';
// Fallback vers les données statiques
import { guests as staticGuests } from '@/data/guests';
import { tables as staticTables } from '@/data/tables';

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Guest | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const bgUrl = 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  // Charger les données depuis l'API avec fallback
  useEffect(() => {
    async function loadData() {
      try {
        const [tablesRes, guestsRes] = await Promise.all([
          fetch('/api/tables'),
          fetch('/api/guests')
        ]);
        
        if (tablesRes.ok && guestsRes.ok) {
          const tablesData = await tablesRes.json();
          const guestsData = await guestsRes.json();
          
          // Vérifier que les données sont des tableaux
          if (Array.isArray(tablesData) && Array.isArray(guestsData)) {
            setTables(tablesData);
            setGuests(guestsData);
          } else {
            throw new Error('Les données de l\'API ne sont pas au bon format');
          }
        } else {
          throw new Error('Erreur HTTP lors de la récupération des données');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données depuis l\'API, utilisation des données statiques:', error);
        // Fallback vers les données statiques
        setTables(staticTables);
        setGuests(staticGuests);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const handleSearch = () => {
    const guest = guests.find(g => g.name.toLowerCase().includes(query.toLowerCase()));
    setResult(guest || null);
  };

  useEffect(() => {
    if (result) {
      // Délai pour laisser le temps au rendu de se terminer
      setTimeout(() => {
        const highlightedTable = document.getElementById(`table-${result.tableId}`);
        if (highlightedTable) {
          // Scroll vers la table spécifique mise en évidence
          highlightedTable.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        } else if (tableRef.current) {
          // Fallback vers le conteneur du plan de table
          tableRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }
      }, 150);
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
      <div className="relative z-10 p-4 text-black flex flex-col items-center space-y-4 bg-gray-100 rounded">
        <h1 className="text-xl font-bold text-black">CHERCHER VOTRE PLACE</h1>

        {usingFallback && (
          <div className="text-xs text-gray-600 bg-yellow-100 px-2 py-1 rounded">
            Mode hors ligne - Données statiques
          </div>
        )}

        {!usingFallback && !loading && (
          <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
            ✅ Connecté à la base de données
          </div>
        )}

        <div className="flex space-x-2">
          <input
            type="text"
            className="border px-3 py-2 text-black rounded"
            placeholder="Nom"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="bg-gray-400 hover:bg-gray-600 px-4 py-2 rounded text-black"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Rechercher'}
          </button>
        </div>

        {result && (<p>🪑 {result.name} est à la table {result.tableId}</p>)}

        {loading ? (
          <div className="text-center py-8">
            <p>Chargement des tables...</p>
          </div>
        ) : (
          <div ref={tableRef}>
            <TablePlan tables={tables} highlightId={result?.tableId} />
          </div>
        )}
      </div>
    </main>
  );
}
