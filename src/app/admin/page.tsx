'use client';

import { useState, useEffect } from 'react';
import { Guest, Table } from '@/types';

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // États pour le formulaire d'ajout/modification
  const [isEditing, setIsEditing] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tableId: 1
  });

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tablesRes, guestsRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/guests')
      ]);
      
      if (tablesRes.ok && guestsRes.ok) {
        const tablesData = await tablesRes.json();
        const guestsData = await guestsRes.json();
        
        if (Array.isArray(tablesData) && Array.isArray(guestsData)) {
          setTables(tablesData);
          setGuests(guestsData);
        } else {
          throw new Error('Format de données invalide');
        }
      } else {
        throw new Error('Erreur API');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      // Fallback vers les données statiques
      const { guests: staticGuests } = await import('@/data/guests');
      const { tables: staticTables } = await import('@/data/tables');
      setGuests(staticGuests);
      setTables(staticTables);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usingFallback) {
      alert('Mode hors ligne - Les modifications ne seront pas sauvegardées');
      return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/guests/${editingGuest?.id}` : '/api/guests';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadData(); // Recharger les données
        resetForm();
        alert(isEditing ? 'Invité modifié avec succès!' : 'Invité ajouté avec succès!');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (guest: Guest) => {
    setIsEditing(true);
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      tableId: guest.tableId
    });
  };

  const handleDelete = async (guestId: number) => {
    if (usingFallback) {
      alert('Mode hors ligne - Les modifications ne seront pas sauvegardées');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet invité ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
        alert('Invité supprimé avec succès!');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingGuest(null);
    setFormData({
      name: '',
      tableId: 1
    });
  };

  // Filtrage des invités
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = selectedTable === 'all' || guest.tableId === selectedTable;
    return matchesSearch && matchesTable;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration - Gestion des invités</h1>
              
              {usingFallback && (
                <div className="mt-2 text-sm text-yellow-600 bg-yellow-100 px-3 py-2 rounded">
                  ⚠️ Mode hors ligne - Modifications non sauvegardées
                </div>
              )}
              
              {!usingFallback && (
                <div className="mt-2 text-sm text-green-600 bg-green-100 px-3 py-2 rounded">
                  ✅ Connecté à la base de données
                </div>
              )}
            </div>
            
            <a
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
            >
              ← Retour au plan de table
            </a>
          </div>

          <div className="p-6">
            {/* Formulaire d'ajout/modification */}
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">
                {isEditing ? 'Modifier un invité' : 'Ajouter un invité'}
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'invité
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Nom de l'invité"
                    required
                  />
                </div>
                
                <div className="min-w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table
                  </label>
                  <select
                    value={formData.tableId}
                    onChange={(e) => setFormData({ ...formData, tableId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {tables.map(table => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md"
                  >
                    {isEditing ? 'Modifier' : 'Ajouter'}
                  </button>
                  
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Filtres */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Rechercher un invité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div className="min-w-48">
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">Toutes les tables</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Liste des invités */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Invités ({filteredGuests.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Table
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {guest.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Table {guest.tableId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(guest)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredGuests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun invité trouvé
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
