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
    
    return (
      
      <div className="productcard">
        <Link to={`/productdetail/${product.ProductID}`} className="product-card-link">
          <div className="imagecarousel">
              {product.ImageUrls && product.ImageUrls.length > 0 && (
                  <img src={product.ImageUrls[activeIndex]} alt={`Product ${product.Name} Image`} className="productimage" />
              )}
          </div>
          
          <div className="productinfo">
            
              <h3>{product.Name}</h3>
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

  const handleSearch = (event) => {
    event.preventDefault();
    console.log('Searching for:', searchQuery);
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





