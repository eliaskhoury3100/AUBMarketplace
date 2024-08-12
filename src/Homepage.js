// HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';


const HomePage = () => {
  const [username, setUsername] = useState('');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [noProductsFound, setNoProductsFound] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    size: '',
    warranty: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    uploadDate: ''
  });

  const toggleFilterPanel = () => {
    setShowFilterPanel(prev => !prev);
};
  
const FilterPanel = ({ onClose, filters, setFilters }) => {
  const clothingCategories = ['Clothing for Men', 'Clothing for Women', 'Sports Wear for Men', 'Sports Wear for Women'];
  const electronicsCategories = [
    'Mobile Phones & Accessories', 'Laptops & Tablets', 'Computers & Computer Parts', 
    'Gaming Consoles & Video Games', 'TV', 'Speakers', 'Cameras'
  ];
  
  const applyFilters = () => {
    handleSearch();  // Trigger the search with the selected filters
    resetFilters();  // Reset the filter values
    onClose();       // Close the filter panel
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      size: '',
      warranty: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      uploadDate: ''
    });
  };
  return (
    <div style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100vh', 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      zIndex: 1000 // Ensure it appears above other content
    }}>
      <div style={{
        backgroundColor: 'white', 
        padding: '20px', 
        width: '90%', 
        maxWidth: '600px', // Restrict maximum width
        borderRadius: '8px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2 style={{
          marginBottom: '20px',
          color: '#333',
          fontSize: '1.5rem',
          textAlign: 'center'
        }}>Filter Products</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '1rem', color: '#555' }}>By Category:</label>
          <select 
            value={filters.category} 
            onChange={e => setFilters({ ...filters, category: e.target.value })} 
            style={{
              width: '100%', 
              padding: '10px', 
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#f9f9f9',
              fontSize: '1rem'
            }}
          >
            <option value="">Select Category</option>
            <optgroup label="Electronics">
              <option value="Mobile Phones & Accessories">Mobile Phones & Accessories</option>
              <option value="Laptops & Tablets">Laptops & Tablets</option>
              <option value="Computers & Computer Parts">Computers & Computer Parts</option>
              <option value="Gaming Consoles & Video Games">Gaming Consoles & Video Games</option>
              <option value="TV">TV</option>
              <option value="Speakers">Speakers</option>
              <option value="Cameras">Cameras</option>
            </optgroup>
            <optgroup label="Fashion">
              <option value="Clothing for Men">Clothing for Men</option>
              <option value="Accessories for Men">Accessories for Men</option>
              <option value="Clothing for Women">Clothing for Women</option>
              <option value="Accessories for Women">Accessories for Women</option>
              <option value="Makeup and Cosmetics">Makeup and Cosmetics</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Watches">Watches</option>
              <option value="Shoes">Shoes</option>
            </optgroup>
            <optgroup label="Sports & Outdoors">
              <option value="Sports Wear for Men">Sports Wear for Men</option>
              <option value="Sports Wear for Women">Sports Wear for Women</option>
              <option value="Sports Equipment">Sports Equipment</option>
            </optgroup>
            <optgroup label="Entertainment & Hobbies">
              <option value="Musical Instruments & Gear">Musical Instruments & Gear</option>
              <option value="Books">Books</option>
              <option value="Music & Movies">Music & Movies</option>
              <option value="Stationery">Stationery</option>
            </optgroup>
          </select>
        </div>

        {/* Conditional Filter: By Size for Clothing and Sports Wear */}
        {clothingCategories.includes(filters.category) && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '1rem', color: '#555' }}>By Size:</label>
            <select
              value={filters.size || ''} // Use an optional chaining to avoid errors if size isn't initialized
              onChange={e => setFilters({ ...filters, size: e.target.value })}
              style={{
                width: '100%', 
                padding: '10px', 
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#f9f9f9',
                fontSize: '1rem'
              }}
            >
              <option value="">Select Size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
        )}

        {/* Conditional Filter: Warranty for Electronics */}
        {electronicsCategories.includes(filters.category) && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '1rem', color: '#555' }}>Warranty:</label>
            <select
              value={filters.warranty || ''} // Use an optional chaining to avoid errors if warranty isn't initialized
              onChange={e => setFilters({ ...filters, warranty: e.target.value })}
              style={{
                width: '100%', 
                padding: '10px', 
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#f9f9f9',
                fontSize: '1rem'
              }}
            >
              <option value="">Select Warranty</option>
              <option value="No Warranty">No Warranty</option>
              <option value="6 Months">6 Months</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
            </select>
          </div>
        )}

        {/* Filter: By Condition */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '1rem', color: '#555' }}>By Condition:</label>
          <select
            value={filters.condition || ''} // Use an optional chaining to avoid errors if condition isn't initialized
            onChange={e => setFilters({ ...filters, condition: e.target.value })}
            style={{
              width: '100%', 
              padding: '10px', 
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: '#f9f9f9',
              fontSize: '1rem'
            }}
          >
            <option value="">Select Condition</option>
            <option value="New">New</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Satisfactory">Satisfactory</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '1rem', color: '#555' }}>By Price:</label>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <input 
              type="text" 
              placeholder="Min"
              value={filters.minPrice || ''} 
              onChange={e => setFilters({ ...filters, minPrice: e.target.value })} 
              style={{
                width: '48%', 
                padding: '10px', 
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#f9f9f9',
                fontSize: '1rem'
              }} 
            />
            <input 
              type="text" 
              placeholder="Max"
              value={filters.maxPrice || ''} 
              onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} 
              style={{
                width: '48%', 
                padding: '10px', 
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#f9f9f9',
                fontSize: '1rem'
              }} 
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
  <label style={{ fontSize: '1rem', color: '#555' }}>
    Uploaded After:

   
  </label>
  <input 
    type="date" 
    value={filters.uploadDate} 
    onChange={e => setFilters({ ...filters, uploadDate: e.target.value })} 
    style={{
      width: '100%', 
      padding: '10px', 
      marginTop: '5px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      backgroundColor: '#f9f9f9',
      fontSize: '1rem'
    }} 
  />
</div>


<button 
          onClick={applyFilters}  // Use the applyFilters function
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            Filter
        </button>
      </div>
    </div>
  );
};




  


  useEffect(() => {
    const fetchUserProfile = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const userApiUrl = `https://aymj5wwai6.execute-api.eu-north-1.amazonaws.com/retreiveUserInfo?userId=${localStorage.getItem('userId')}`;
      try {
        const response = await fetch(userApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
  
        if (response.ok) {
          const userData = await response.json();
          const imageUrl = userData['custom:ProfilePicture'];
          if (imageUrl) {
              setProfileImage(`${imageUrl}?${new Date().getTime()}`); // Appending timestamp to force browser to reload image
          } else {
              setProfileImage('https://marketplacepictures.s3.eu-north-1.amazonaws.com/s3.png');
          }

          console.log("User profile fetched successfully:", userData);
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
  
    fetchUserProfile();
    fetchProducts(); // Fetch products as before
  }, []);
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || 'Guest');
    fetchProducts();
  }, []);

  const ProductCard = ({ product }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleDotClick = (index) => {
        setActiveIndex(index);
    };
    const sk = encodeURIComponent(product.SK);
    const pk = encodeURIComponent(product.PK);
   

    return (
      
      <div className="productcard">
        <Link to={`/productdetail/${sk}/${pk}`} className="product-card-link">
          <div className="imagecarousel">
              {product.ImageUrl && product.ImageUrl.length > 0 && (
                  <img src={product.ImageUrl[activeIndex]} alt={`Product ${product.Title} Image`} className="productimage" />
              )}
          </div>
          
          <div className="productinfo">
            
              <h3>{product.Title}</h3>
              <p>${product.Price}</p>
          </div>
        </Link>
      </div>
      
  );
  };

  const fetchProducts = async () => {
    const apiUrl = 'https://x1sojvv2x7.execute-api.eu-north-1.amazonaws.com/default/retreiveProductshomepage';
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setProducts(data);
        
        console.log("Products fetched successfully:", data);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = async (event) => {
    if (event) event.preventDefault();  // Only call preventDefault if event exists

    setLoading(true);
    setError(null);
    setNoProductsFound(false);

    if (!searchQuery && !filters.category && !filters.price && !filters.uploadDate) {
        // If no search query and no filters, fetch all products or reset to default
        fetchProducts();
        setLoading(false);
        return;
    }

    const accessToken = localStorage.getItem('accessToken');
    try {
        const url = new URL('https://ihi32c2u6i.execute-api.eu-north-1.amazonaws.com/default/searchqueries');

        if (searchQuery) {
          url.searchParams.append('query_text', searchQuery);
          console.log('query_text:', searchQuery);
      }
      if (filters.category) {
          url.searchParams.append('category', filters.category);
          console.log('category:', filters.category);
      }
      if (filters.price) {
          url.searchParams.append('price', filters.price);
          console.log('price:', filters.price);
      }
      if (filters.uploadDate) {
          url.searchParams.append('upload_date', filters.uploadDate);
          console.log('upload_date:', filters.uploadDate);
      }
      if (filters.minPrice) {
          url.searchParams.append('min_price', filters.minPrice);
          console.log('min_price:', filters.minPrice);
      }
      if (filters.maxPrice) {
          url.searchParams.append('max_price', filters.maxPrice);
          console.log('max_price:', filters.maxPrice);
      }
      if (filters.size) {
          url.searchParams.append('size', filters.size);
          console.log('size:', filters.size);
      }
      if (filters.warranty) {
          url.searchParams.append('warranty', filters.warranty);
          console.log('warranty:', filters.warranty);
      }
      if (filters.condition) {
          url.searchParams.append('condition', filters.condition);
          console.log('condition:', filters.condition);
      }
  
      console.log('Final URL:', url.toString());

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Search results:', data);

        // Assuming 'data' is the object containing 'hits', and 'hits' contains an array of results
        if (data.hits && data.hits.hits.length > 0) {
            // Extract the '_source' from each hit and set it to products
            const products = data.hits.hits.map(hit => hit._source);
            setProducts(products);  // This updates your products state
        } else {
            setProducts([]);  // Set to empty if no results
            setNoProductsFound(true);  // Set to true since no products were found
        }
    } catch (error) {
        console.error('Failed to fetch:', error);
        setError(error.message);
    } finally {
        setLoading(false);
    }
};

  
  

  return (
    <div class="homecontainer">
      <div className="topsection">
       <nav className="uppernav">
        <img src="https://marketplacepictures.s3.eu-north-1.amazonaws.com/logo.png" alt="Logo" className="nav-logo" />
        <h1>AUB MarketPlace</h1>
        <div className="profile-picture-container">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-picture" />
          ) : (
            <img src="https://marketplacepictures.s3.eu-north-1.amazonaws.com/default-profile.png" alt="Default Profile" className="profile-picture" />
          )}
        </div>
        </nav>
        
        <form onSubmit={handleSearch} className="search-form">
            <div className="search-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    style={{ paddingRight: '50px' }} // Make room for the dropdown
                />
                <button
            type="button"
            onClick={toggleFilterPanel}
            className="filter-button"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              color: 'gray',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            Filter
          </button>
            </div>
        </form>
        
    </div>
    {showFilterPanel && <FilterPanel onClose={() => setShowFilterPanel(false)} filters={filters} setFilters={setFilters} />}
    <div className="myitemscontainer">
      {noProductsFound ? (
        <p>No products found!</p>
      ) : (
        products.map(product => (
          <ProductCard key={product.ProductID} product={product} />
        ))
        
      )}
    </div>
  </div>
);
};

export default HomePage;





