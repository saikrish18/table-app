import React, { useState, useEffect } from 'react';
import './App.css';
import * as XLSX from 'xlsx';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetch('https://dummyjson.com/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data.products);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, []);

  const handleSort = key => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const toggleSelectRow = productId => {
    if (selectedRows.includes(productId)) {
      setSelectedRows(selectedRows.filter(id => id !== productId));
    } else {
      setSelectedRows([...selectedRows, productId]);
    }
  };

  const handleViewDetails = product => {
    setSelectedProduct(product);
  };

  const handleDownloadExcel = () => {
    const selectedProducts = products.filter(product =>
      selectedRows.includes(product.id)
    );
  
    const ws = XLSX.utils.json_to_sheet(selectedProducts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Selected Products');
  
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected_products.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };
  

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="App">
      <h1>Product Table</h1>
      <div>
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={e => {
            console.log('Search Query:', e.target.value);
            setSearchQuery(e.target.value)}}
        />
        <div>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  selectedRows.length > 0 &&
                  selectedRows.length === products.length
                }
                onChange={() =>
                  setSelectedRows(
                    selectedRows.length === products.length
                      ? []
                      : products.map(p => p.id)
                  )
                }
              />
            </th>
            <th>ID</th>
            <th onClick={() => handleSort('name')}>
              Name {sortKey === 'name' && sortOrder === 'asc' ? '▲' : '▼'}
            </th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products
            .filter(product =>
              product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .filter(product =>
              (!minPrice || product.price >= minPrice) &&
              (!maxPrice || product.price <= maxPrice)
            )
            .sort((a, b) => {
              const key = sortKey || 'id';
              const order = sortOrder === 'asc' ? 1 : -1;
              return a[key].localeCompare(b[key]) * order;
            })
            .map(product => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(product.id)}
                    onChange={() => toggleSelectRow(product.id)}
                  />
                </td>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>
                  <button onClick={() => handleViewDetails(product)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {selectedRows.length > 0 && (
        <button onClick={handleDownloadExcel}>Download Selected as Excel</button>
      )}
      {selectedProduct && (
        <div>
          <h2>Product Details</h2>
          <p>Name: {selectedProduct.name}</p>
          <p>Price: {selectedProduct.price}</p>
          {/* ... other details ... */}
          <button onClick={() => setSelectedProduct(null)}>Close Details</button>
        </div>
      )}
    </div>
  );
}

export default App;
