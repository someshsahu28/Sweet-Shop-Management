import React, { useState, useEffect } from 'react';
import { Sweet } from '../services/api';
import './Modal.css';

interface EditSweetModalProps {
  sweet: Sweet;
  onClose: () => void;
  onUpdate: (id: number, sweet: Partial<Sweet>) => void;
}

const EditSweetModal: React.FC<EditSweetModalProps> = ({ sweet, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: sweet.name,
    category: sweet.category,
    price: sweet.price.toString(),
    quantity: sweet.quantity.toString()
  });

  useEffect(() => {
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString()
    });
  }, [sweet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(sweet.id, {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity)
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Sweet</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
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
              onChange={(e) => handleChange('price', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-primary">Update Sweet</button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSweetModal;

