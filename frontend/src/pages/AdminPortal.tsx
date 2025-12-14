import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sweetsApi, Sweet } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './AdminPortal.css';

const AdminPortal: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSweets: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSweet, setNewSweet] = useState({
    name: '',
    category: '',
    price: '',
    quantity: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isAdmin()) {
      console.warn('Access denied: User is not an admin. Role:', user.role);
      alert('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }
    loadSweets();
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    calculateStats();
  }, [sweets]);

  const loadSweets = async () => {
    try {
      setLoading(true);
      const data = await sweetsApi.getAll();
      setSweets(data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalSweets = sweets.length;
    const totalStock = sweets.reduce((sum, s) => sum + s.quantity, 0);
    const lowStock = sweets.filter(s => s.quantity > 0 && s.quantity < 10).length;
    const outOfStock = sweets.filter(s => s.quantity === 0).length;
    const totalValue = sweets.reduce((sum, s) => sum + (s.price * s.quantity), 0);

    setStats({
      totalSweets,
      totalStock,
      lowStock,
      outOfStock,
      totalValue
    });
  };

  const handleAddSweet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sweet = await sweetsApi.create({
        name: newSweet.name,
        category: newSweet.category,
        price: parseFloat(newSweet.price),
        quantity: parseInt(newSweet.quantity)
      });
      setSweets([...sweets, sweet]);
      setShowAddModal(false);
      setNewSweet({ name: '', category: '', price: '', quantity: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add sweet');
    }
  };

  const handleUpdateSweet = async (id: number, updates: Partial<Sweet>) => {
    try {
      const updated = await sweetsApi.update(id, updates);
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

  if (loading) {
    return <div className="admin-loading">Loading admin portal...</div>;
  }

  return (
    <div className="admin-portal">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>🔐 Admin Portal</h1>
          <div className="admin-header-actions">
            <span className="admin-user-info">Admin: {user?.username}</span>
            <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </button>
            <button className="btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalSweets}</div>
          <div className="stat-label">Total Sweets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalStock}</div>
          <div className="stat-label">Total Stock</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{stats.lowStock}</div>
          <div className="stat-label">Low Stock (&lt;10)</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{stats.outOfStock}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">${stats.totalValue.toFixed(2)}</div>
          <div className="stat-label">Total Inventory Value</div>
        </div>
      </div>

      <div className="admin-actions">
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Sweet
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sweets.map(sweet => (
              <tr key={sweet.id} className={sweet.quantity === 0 ? 'out-of-stock-row' : sweet.quantity < 10 ? 'low-stock-row' : ''}>
                <td>{sweet.id}</td>
                <td>{sweet.name}</td>
                <td>{sweet.category}</td>
                <td>${sweet.price.toFixed(2)}</td>
                <td>{sweet.quantity}</td>
                <td>
                  {sweet.quantity === 0 ? (
                    <span className="status-badge danger">Out of Stock</span>
                  ) : sweet.quantity < 10 ? (
                    <span className="status-badge warning">Low Stock</span>
                  ) : (
                    <span className="status-badge success">In Stock</span>
                  )}
                </td>
                <td>
                  <div className="admin-actions-cell">
                    <button
                      className="btn-small btn-edit"
                      onClick={() => setEditingSweet(sweet)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-small btn-restock"
                      onClick={() => {
                        const qty = prompt('Enter quantity to add:');
                        if (qty && parseInt(qty) > 0) {
                          handleRestock(sweet.id, parseInt(qty));
                        }
                      }}
                    >
                      Restock
                    </button>
                    <button
                      className="btn-small btn-delete"
                      onClick={() => handleDeleteSweet(sweet.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Sweet</h2>
            <form onSubmit={handleAddSweet}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newSweet.name}
                  onChange={(e) => setNewSweet({ ...newSweet, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={newSweet.category}
                  onChange={(e) => setNewSweet({ ...newSweet, category: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newSweet.price}
                  onChange={(e) => setNewSweet({ ...newSweet, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newSweet.quantity}
                  onChange={(e) => setNewSweet({ ...newSweet, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Sweet</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSweet && (
        <div className="modal-overlay" onClick={() => setEditingSweet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Sweet</h2>
            <EditSweetForm
              sweet={editingSweet}
              onUpdate={handleUpdateSweet}
              onClose={() => setEditingSweet(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const EditSweetForm: React.FC<{
  sweet: Sweet;
  onUpdate: (id: number, updates: Partial<Sweet>) => void;
  onClose: () => void;
}> = ({ sweet, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: sweet.name,
    category: sweet.category,
    price: sweet.price.toString(),
    quantity: sweet.quantity.toString()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(sweet.id, {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Quantity</label>
        <input
          type="number"
          min="0"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
        />
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-primary">Update</button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminPortal;
