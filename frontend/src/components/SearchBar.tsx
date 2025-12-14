import React from 'react';
import './SearchBar.css';

interface SearchBarProps {
  searchParams: {
    name: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  };
  setSearchParams: React.Dispatch<React.SetStateAction<{
    name: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  }>>;
  categories: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchParams,
  setSearchParams,
  categories
}) => {
  const handleChange = (field: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchParams({
      name: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  return (
    <div className="search-bar">
      <div className="search-row">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchParams.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="search-input"
        />
        <select
          value={searchParams.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="search-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={searchParams.minPrice}
          onChange={(e) => handleChange('minPrice', e.target.value)}
          className="search-input price-input"
          min="0"
          step="0.01"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={searchParams.maxPrice}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
          className="search-input price-input"
          min="0"
          step="0.01"
        />
        <button onClick={clearFilters} className="btn-clear">
          Clear
        </button>
      </div>
    </div>
  );
};

export default SearchBar;

