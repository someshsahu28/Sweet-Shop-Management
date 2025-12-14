import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sweetsApi, Sweet } from '../services/api';
import SweetCard from '../components/SweetCard';
import SearchBar from '../components/SearchBar';
import AddSweetModal from '../components/AddSweetModal';
import EditSweetModal from '../components/EditSweetModal';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [searchParams, setSearchParams] = useState({
    name: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    loadSweets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sweets, searchParams]);

  const loadSweets = async () => {
    try {
      setLoading(true);
      const data = await sweetsApi.getAll();
      setSweets(data);
      setFilteredSweets(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const params: any = {};
      if (searchParams.name) params.name = searchParams.name;
      if (searchParams.category) params.category = searchParams.category;
      if (searchParams.minPrice) params.minPrice = parseFloat(searchParams.minPrice);
      if (searchParams.maxPrice) params.maxPrice = parseFloat(searchParams.maxPrice);

      if (Object.keys(params).length > 0) {
        const filtered = await sweetsApi.search(params);
        setFilteredSweets(filtered);
      } else {
        setFilteredSweets(sweets);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed');
    }
  };

  const handlePurchase = async (id: number) => {
    try {
      const updated = await sweetsApi.purchase(id);
      setSweets(sweets.map(s => s.id === id ? updated : s));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Purchase failed');
    }
  };

  const handleAddSweet = async (sweet: Omit<Sweet, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSweet = await sweetsApi.create(sweet);
      setSweets([...sweets, newSweet]);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add sweet');
    }
  };

  const handleUpdateSweet = async (id: number, sweet: Partial<Sweet>) => {
    try {
      const updated = await sweetsApi.update(id, sweet);
      setSweets(sweets.map(s => s.id === id ? updated : s));
      setEditingSweet(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update sweet');
    }
  };

  const handleDeleteSweet = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) return;

    try {
      await sweetsApi.delete(id);
      setSweets(sweets.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete sweet');
    }
  };

  const handleRestock = async (id: number, quantity: number) => {
    try {
      const updated = await sweetsApi.restock(id, quantity);
      setSweets(sweets.map(s => s.id === id ? updated : s));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Restock failed');
    }
  };

  const categories = Array.from(new Set(sweets.map(s => s.category)));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🍬 Sweet Shop Management</h1>
          <div className="header-actions">
            <span className="user-info">
              Welcome, {user?.username}! 
              {isAdmin() && <span style={{color: '#667eea', marginLeft: '8px'}}>👑 Admin</span>}
            </span>
            {isAdmin() && (
              <>
                <button 
                  className="btn-secondary" 
                  onClick={() => navigate('/admin')}
                  style={{background: '#667eea', color: 'white'}}
                >
                  🔐 Admin Portal
                </button>
                <button className="btn-secondary" onClick={() => setShowAddModal(true)}>
                  + Add Sweet
                </button>
              </>
            )}
            <button className="btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <SearchBar
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          categories={categories}
        />

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading">Loading sweets...</div>
        ) : filteredSweets.length === 0 ? (
          <div className="empty-state">No sweets found</div>
        ) : (
          <div className="sweets-grid">
            {filteredSweets.map(sweet => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                onPurchase={handlePurchase}
                onEdit={isAdmin() ? () => setEditingSweet(sweet) : undefined}
                onDelete={isAdmin() ? handleDeleteSweet : undefined}
                onRestock={isAdmin() ? handleRestock : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddSweetModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSweet}
        />
      )}

      {editingSweet && (
        <EditSweetModal
          sweet={editingSweet}
          onClose={() => setEditingSweet(null)}
          onUpdate={handleUpdateSweet}
        />
      )}
    </div>
  );
};

export default Dashboard;

