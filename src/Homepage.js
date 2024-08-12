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
    console.log(`Encoded SK: ${sk}`);
    console.log(`Encoded PK: ${pk}`);


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
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!searchQuery) {
      // If the search query is empty, fetch all products or reset to default
      fetchProducts();
      setLoading(false);
      return;
    }
  
    const accessToken = localStorage.getItem('accessToken');
    try {
      const url = new URL('https://ihi32c2u6i.execute-api.eu-north-1.amazonaws.com/default/searchqueries');
      url.searchParams.append('query_text', searchQuery);  // Append the search query as a parameter
  
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
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    
                    className="category-select"
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
                    <option value="">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="books">Books</option>
                    <option value="clothing">Clothing</option>
                    {/* Add more categories as needed */}
                </select>
            </div>
        </form>
        
    </div>
    <div className="myitemscontainer">
          {products.filter(product => category === '' || product.Category === category).map(product => (
            <ProductCard key={product.ProductID} product={product} />
          ))}
    </div>
</div>

   
  );
};

export default HomePage;





