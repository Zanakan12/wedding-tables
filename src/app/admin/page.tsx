'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Guest, Table } from '@/types';
import DraggableTablePlan from '@/components/DraggableTablePlan';

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  // États pour la gestion des tables
  const [activeTab, setActiveTab] = useState<'guests' | 'tables'>('guests');
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [tableFormData, setTableFormData] = useState({
    name: '',
    capacity: 8,
    x: 0,
    y: 0
  });
  
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
    // Vérifier l'authentification
    const isAuth = sessionStorage.getItem('adminAuth') === 'true';
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    loadData();
  }, [router]);

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

  const resetTableForm = () => {
    setIsEditingTable(false);
    setEditingTable(null);
    setTableFormData({
      name: '',
      capacity: 8,
      x: 0,
      y: 0
    });
  };

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usingFallback) {
      alert('Mode hors ligne - Les modifications ne seront pas sauvegardées');
      return;
    }

    try {
      const method = isEditingTable ? 'PUT' : 'POST';
      const url = isEditingTable ? `/api/tables/${editingTable?.id}` : '/api/tables';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableFormData),
      });

      if (response.ok) {
        await loadData();
        resetTableForm();
        alert(isEditingTable ? 'Table modifiée avec succès!' : 'Table ajoutée avec succès!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleEditTable = (table: Table) => {
    setIsEditingTable(true);
    setEditingTable(table);
    setSelectedTableId(table.id);
    setTableFormData({
      name: table.name,
      capacity: table.capacity,
      x: table.x,
      y: table.y
    });
  };

  const handleTableClick = (tableId: number) => {
    setSelectedTableId(tableId);
    const table = tables.find(t => t.id === tableId);
    if (table) {
      handleEditTable(table);
    }
  };

  const handleGuestMove = async (guestId: number, fromTableId: number, toTableId: number) => {
    if (usingFallback) {
      alert('Mode hors ligne - Les modifications ne seront pas sauvegardées');
      return;
    }

    try {
      const guest = guests.find(g => g.id === guestId);
      if (!guest) return;

      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: guest.name,
          tableId: toTableId
        }),
      });

      if (response.ok) {
        // Mettre à jour localement les données pour un feedback immédiat
        setGuests(prevGuests => 
          prevGuests.map(g => 
            g.id === guestId ? { ...g, tableId: toTableId } : g
          )
        );
        
        // Recharger les données depuis le serveur pour synchroniser
        await loadData();
        
        const fromTable = tables.find(t => t.id === fromTableId);
        const toTable = tables.find(t => t.id === toTableId);
        console.log(`✅ ${guest.name} déplacé de ${fromTable?.name} vers ${toTable?.name}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du déplacement');
      }
    } catch (error) {
      console.error('Erreur lors du déplacement de l\'invité:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors du déplacement');
      // Recharger les données en cas d'erreur pour annuler le changement local
      await loadData();
    }
  };

  const handleDeleteTable = async (tableId: number) => {
    if (usingFallback) {
      alert('Mode hors ligne - Les modifications ne seront pas sauvegardées');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
        alert('Table supprimée avec succès!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  };

  // Filtrage des invités
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = selectedTable === 'all' || guest.tableId === selectedTable;
    return matchesSearch && matchesTable;
  });

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des accès...</p>
        </div>
      </div>
    );
  }

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
            
            <div className="flex gap-2">
              <Link
                href="/"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
              >
                ← Retour au plan de table
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Onglets */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('guests')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'guests'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestion des invités
                </button>
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'tables'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestion des tables
                </button>
              </nav>
            </div>

            {activeTab === 'guests' && (
              <>
                {/* Formulaire d'ajout/modification d'invités */}
                <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4">
                    {isEditing ? 'Modifier un invité' : 'Ajouter un invité'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-64">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de l&apos;invité
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Nom de l&apos;invité"
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
                            {table.name} (Capacité: {table.capacity})
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

                {/* Filtres pour les invités */}
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
              </>
            )}

            {activeTab === 'tables' && (
              <>
                {/* Formulaire d'ajout/modification de tables */}
                <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4">
                    {isEditingTable ? 'Modifier une table' : 'Ajouter une table'}
                  </h2>
                  
                  <form onSubmit={handleTableSubmit} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-48">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la table
                      </label>
                      <input
                        type="text"
                        value={tableFormData.name}
                        onChange={(e) => setTableFormData({ ...tableFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Nom de la table"
                        required
                      />
                    </div>
                    
                    <div className="min-w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacité
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={tableFormData.capacity}
                        onChange={(e) => setTableFormData({ ...tableFormData, capacity: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                    
                    <div className="min-w-24">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position X
                      </label>
                      <input
                        type="number"
                        value={tableFormData.x}
                        onChange={(e) => setTableFormData({ ...tableFormData, x: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                    
                    <div className="min-w-24">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position Y
                      </label>
                      <input
                        type="number"
                        value={tableFormData.y}
                        onChange={(e) => setTableFormData({ ...tableFormData, y: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md"
                      >
                        {isEditingTable ? 'Modifier' : 'Ajouter'}
                      </button>
                      
                      {isEditingTable && (
                        <button
                          type="button"
                          onClick={resetTableForm}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Plan de table interactif */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Plan de table</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>🤏 Drag & Drop :</strong> Glissez-déposez les invités entre les tables<br/>
                      <strong>👆 Clic :</strong> Cliquez sur une table pour la sélectionner et la modifier
                    </p>
                    
                    {/* Légende */}
                    <div className="mb-4 flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                        <span>Complet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                        <span>Surcharge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-200 border-2 border-purple-500 rounded"></div>
                        <span>Zone de dépôt</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-200 border-2 border-blue-500 rounded"></div>
                        <span>Sélectionnée</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <DraggableTablePlan 
                        tables={tables} 
                        guests={guests}
                        highlightId={selectedTableId ?? undefined}
                        onTableClick={handleTableClick}
                        onGuestMove={handleGuestMove}
                      />
                    </div>
                  </div>
                </div>

                {/* Liste des tables */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Tables ({tables.length})
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
                            Capacité
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invités
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tables.map((table) => {
                          const guestCount = guests.filter(g => g.tableId === table.id).length;
                          return (
                            <tr key={table.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {table.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {table.capacity} personnes
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  guestCount > table.capacity 
                                    ? 'bg-red-100 text-red-800' 
                                    : guestCount === table.capacity
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {guestCount}/{table.capacity}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ({table.x}, {table.y})
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleEditTable(table)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleDeleteTable(table.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
