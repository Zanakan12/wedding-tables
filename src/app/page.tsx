'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import TablePlan from '@/components/TablePlan';
import { Guest, Table } from '@/types';
// Fallback vers les données statiques
import { guests as staticGuests } from '@/data/guests';
import { tables as staticTables } from '@/data/tables';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Guest[]>([]);
  const [searching, setSearching] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [highlightedTableIds, setHighlightedTableIds] = useState<number[]>([]);
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

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setHighlightedTableIds([]);
      return;
    }

    setSearching(true);
    
    try {
      if (usingFallback) {
        // Recherche locale si on utilise les données statiques
        const foundGuests = guests.filter(g => 
          g.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(foundGuests);
        setHighlightedTableIds(foundGuests.map(g => g.tableId));
      } else {
        // Recherche via l'API
        const response = await fetch(`/api/search?name=${encodeURIComponent(query)}`);
        if (response.ok) {
          const foundGuests = await response.json();
          setResults(Array.isArray(foundGuests) ? foundGuests : []);
          setHighlightedTableIds(foundGuests.map((g: Guest) => g.tableId));
        } else {
          throw new Error('Erreur lors de la recherche');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      // Fallback vers la recherche locale
      const foundGuests = guests.filter(g => 
        g.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(foundGuests);
      setHighlightedTableIds(foundGuests.map(g => g.tableId));
    } finally {
      setSearching(false);
    }
  }, [query, usingFallback, guests]);

  useEffect(() => {
    // Scroll automatique seulement s'il y a exactement UN résultat
    if (results.length === 1) {
      // Délai pour laisser le temps au rendu de se terminer
      setTimeout(() => {
        // Scroll vers la table du résultat unique
        const tableId = results[0].tableId;
        const highlightedTable = document.getElementById(`table-${tableId}`);
        if (highlightedTable) {
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
    // Pas de scroll automatique si plusieurs résultats (results.length > 1)
  }, [results]);

  // Effet pour déclencher la recherche automatiquement avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
        setHighlightedTableIds([]);
      }
    }, 500); // Attendre 500ms après la dernière frappe

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]); // Se déclenche quand query change

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

        {/* Lien vers l'administration */}
        <div className="w-full flex justify-end">
          <a
            href="/admin/login"
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Administration
          </a>
        </div>

        <div className="flex space-x-2 w-full max-w-md">
          <input
            type="text"
            className="border px-3 py-2 text-black rounded flex-1"
            placeholder="Chercher une personne (ex: Marie)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-gray-400 hover:bg-gray-600 px-4 py-2 rounded text-black"
            disabled={loading || searching}
          >
            {searching ? 'Recherche...' : loading ? 'Chargement...' : 'Rechercher'}
          </button>
        </div>

        {/* Bouton pour effacer la recherche */}
        {results.length > 0 && (
          <button
            onClick={() => {
              setResults([]);
              setQuery('');
              setHighlightedTableIds([]);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Effacer la recherche
          </button>
        )}

        {/* Affichage des résultats */}
        {results.length > 0 && (
          <div className="w-full max-w-md space-y-2">
            <h2 className="font-semibold text-lg">
              {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''} :
            </h2>
            <div className="bg-white border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              {results.map((guest) => {
                const table = tables.find(t => t.id === guest.tableId);
                return (
                  <div key={guest.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <span className="font-medium">🧑‍🤝‍🧑 {guest.name}</span>
                      <div className="text-sm text-gray-600">
                        🪑 Table {table?.name || guest.tableId}
                      </div>
                    </div>
                    {/* Bouton pour aller à la table (seulement si plusieurs résultats) */}
                    {results.length > 1 && (
                      <button
                        onClick={() => {
                          const targetTable = document.getElementById(`table-${guest.tableId}`);
                          if (targetTable) {
                            targetTable.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'center',
                              inline: 'center'
                            });
                          }
                        }}
                        className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        title="Aller à cette table"
                      >
                        👁️ Voir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Message informatif si plusieurs résultats */}
            {results.length > 1 && (
              <p className="text-xs text-gray-500 text-center">
                💡 Cliquez sur &ldquo;👁️ Voir&rdquo; pour aller à une table spécifique
              </p>
            )}
          </div>
        )}

        {/* Message si aucun résultat */}
        {query && !searching && results.length === 0 && (
          <div className="text-center py-4 text-gray-600">
            <p>😔 Aucune personne trouvée pour &ldquo;{query}&rdquo;</p>
            <p className="text-sm">Essayez avec un prénom ou nom différent</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p>Chargement des tables...</p>
          </div>
        ) : (
          <div ref={tableRef}>
            <TablePlan tables={tables} highlightIds={highlightedTableIds} />
          </div>
        )}
      </div>
    </main>
  );
}
