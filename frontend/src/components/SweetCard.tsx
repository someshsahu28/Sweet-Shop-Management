import React, { useState } from 'react';
import { Sweet } from '../services/api';
import './SweetCard.css';

interface SweetCardProps {
  sweet: Sweet;
  onPurchase: (id: number) => void;
  onEdit?: (sweet: Sweet) => void;
  onDelete?: (id: number) => void;
  onRestock?: (id: number, quantity: number) => void;
}

const SweetCard: React.FC<SweetCardProps> = ({
  sweet,
  onPurchase,
  onEdit,
  onDelete,
  onRestock
}) => {
  const [restockQuantity, setRestockQuantity] = useState('10');
  const [showRestock, setShowRestock] = useState(false);

  const handleRestock = () => {
    const quantity = parseInt(restockQuantity);
    if (quantity > 0 && onRestock) {
      onRestock(sweet.id, quantity);
      setShowRestock(false);
      setRestockQuantity('10');
    }
  };

  return (
    <div className="sweet-card">
      <div className="sweet-header">
        <h3>{sweet.name}</h3>
        <span className="category-badge">{sweet.category}</span>
      </div>
      <div className="sweet-body">
        <div className="price">${sweet.price.toFixed(2)}</div>
        <div className={`quantity ${sweet.quantity === 0 ? 'out-of-stock' : ''}`}>
          Quantity: {sweet.quantity}
          {sweet.quantity === 0 && <span className="out-of-stock-label"> (Out of Stock)</span>}
        </div>
      </div>
      <div className="sweet-actions">
        <button
          className={`btn-purchase ${sweet.quantity === 0 ? 'disabled' : ''}`}
          onClick={() => onPurchase(sweet.id)}
          disabled={sweet.quantity === 0}
        >
          {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
        </button>
        {onEdit && (
          <button className="btn-edit" onClick={() => onEdit(sweet)}>
            Edit
          </button>
        )}
        {onDelete && (
          <button className="btn-delete" onClick={() => onDelete(sweet.id)}>
            Delete
          </button>
        )}
        {onRestock && (
          <>
            <button className="btn-restock" onClick={() => setShowRestock(!showRestock)}>
              Restock
            </button>
            {showRestock && (
              <div className="restock-form">
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  placeholder="Quantity"
                />
                <button onClick={handleRestock}>Add</button>
                <button onClick={() => setShowRestock(false)}>Cancel</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SweetCard;

