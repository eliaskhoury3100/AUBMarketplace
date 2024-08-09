import React, { useState, useEffect, useRef } from 'react';
import './UserProfile.css';

const UserProfile = () => {
  const [aboutText, setAboutText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [tempNickname, setTempNickname] = useState('');
  const [dob, setDob] = useState('');
  const [major, setMajor] = useState('');
  const [items, setItems] = useState([]);
  const [profileImage, setProfileImage] = useState('');
  const [message, setMessage] = useState('');

  const editButtonRef = useRef(null);
  const shareButtonRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadButtonRef = useRef(null);

  const userId = localStorage.getItem('userId');
  const storedUsername = localStorage.getItem('username');
  const [products, setProducts] = useState([]);
  
  
  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const userApiUrl = `https://aymj5wwai6.execute-api.eu-north-1.amazonaws.com/retreiveUserInfo?userId=${userId}`;
      try {
        const userResponse = await fetch(userApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setNickname(userData['custom:Nickname'] || '');
          setDob(userData['custom:DOB'] || '');
          setMajor(userData['custom:Major'] || '');
          const imageUrl = userData['custom:ProfilePicture'] || '';
          setProfileImage(`${imageUrl}?${new Date().getTime()}`); // Appending timestamp to force browser to reload image
          setAboutText(userData['custom:AboutYou'] || '');
          console.log(profileImage)
          console.log(profileImage)
          console.log("User data fetched successfully:", userData);
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [userId]);
    

  useEffect(() => {
    const fetchProducts = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !userId) {
        console.error('Access token or userId not found. Please log in again.');
        return;
      }
      
      const apiUrl = `https://f7lm737rz9.execute-api.eu-north-1.amazonaws.com/default/retreiveProducts?userId=${storedUsername}`;
      
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data); // Assuming the data is an array of products
          console.log("Products fetched successfully:", data);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [userId]);

 const ProductCard = ({ product }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleDotClick = (index) => {
        setActiveIndex(index);
    };

    return (
        <div className="productcard1">
            <div className="imagecarousel1">
                {product.ImageUrls && product.ImageUrls.length > 0 && (
                    <img src={product.ImageUrls[activeIndex]} alt={`Product ${product.Name} Image`} className="product-image" />
                )}
            </div>
            
            <div className="productinfo1">
                <h3>{product.Name}</h3>
                <p>${product.Price}</p>
            </div>
        </div>
    );
};

  
  


  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setTempNickname('');
    }
  }, []);

  const handleAboutChange = (e) => {
    setAboutText(e.target.value);
  };

  const handleEditProfileClick = async () => {
    if (isEditing) {
      setNickname(tempNickname);
      const profileData = {
        userId: userId,
        nickname: tempNickname,
        dob: dob,
        major: major,
        aboutText: aboutText,
        profileImage: profileImage
      };
     
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('Access token not found. Please log in again.');
        setMessage('You are not authenticated. Please log in.');
        return;
      }

      const apiUrl = 'https://j1kqweo6he.execute-api.eu-north-1.amazonaws.com/Project/userprofile';
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`  
          },
          body: JSON.stringify(profileData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
        }

        const responseData = await response.json();
        console.log('Profile updated successfully:', responseData);
        setIsEditing(false); // Toggle edit state on successful update
      } catch (error) {
        console.error('Error updating profile:', error);
        setMessage(error.message || 'Failed to update profile');
      }
    } else {
      setTempNickname(nickname);
      setIsEditing(true); // Enable editing
    }
  };

  const handleShareProfileClick = () => {
    setTimeout(() => {
      if (shareButtonRef.current) {
        shareButtonRef.current.focus();
        shareButtonRef.current.style.backgroundColor = '#f1e4e7'; // Keeping the pink color
      }
    }, 0);
  };

  const handleTempNicknameChange = (e) => {
    setTempNickname(e.target.value);
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract Base64 encoded data from the result
        const base64String = reader.result.split(',')[1];
        setProfileImage(base64String);
      };
      reader.onerror = error => console.error('Error reading file:', error);
    }
  };
 


  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="user-profile-container">
      <div className="top-section">
        <div className="profile-header">
          <div className="profile-image-wrapper">
           <img
              src={profileImage ? (profileImage.startsWith('http') ? profileImage : `data:image/jpeg;base64,${profileImage}`) : 'https://marketplacepictures.s3.eu-north-1.amazonaws.com/default-profile.png'}
              alt="Profile"
              className="profile-image"
              onError={(e) => { e.target.onerror = null; e.target.src='https://marketplacepictures.s3.eu-north-1.amazonaws.com/s3.png'; }} // Fallback to a default image if the original doesn't load
            />



          </div>
          <div className="profile-text">
            <div className="username">{username}</div>
            <div className="nickname">{nickname}</div>
          </div>
        </div>
      </div>
      <div className="bottom-section">
        <div className="actions-container">
          <button
            className="action-button"
            onClick={handleEditProfileClick}
            ref={editButtonRef}
            style={{ backgroundColor: '#f1e4e7', color: 'black' }}
          >
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
          <button
            className="action-button"
            onClick={handleShareProfileClick}
            ref={shareButtonRef}
            style={{ backgroundColor: '#f1e4e7', color: 'black' }}
          >
            Share Profile
          </button>
        </div>
        {isEditing && (
          <div className="edit-form">
            <label htmlFor="nickname">Nickname</label>
            <input
              id="nickname"
              type="text"
              placeholder="Enter a nickname"
              value={tempNickname}
              onChange={handleTempNicknameChange}
              className="form-input"
            />
            <label htmlFor="dob">Date of Birth</label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="form-input"
            />
            <label htmlFor="major">Major</label>
            <input
              id="major"
              type="text"
              placeholder="Enter your major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="form-input"
            />
            <button
              className="upload-button"
              onClick={triggerFileSelect}
              ref={uploadButtonRef}
              style={{ backgroundColor: '#ffffff', color: 'black' }}
            >
              Upload Profile Image <span className="plus-icon">+</span>
            </button>
            <input
              type="file"
              id="profileImageInput"
              ref={fileInputRef}
              onChange={handleProfileImageChange}
              style={{ display: 'none' }}
            />
          </div>
        )}
        <div className="about-section">
        <label htmlFor="aboutText" style={{ fontWeight: 'bold' }}>About You</label> 
          <textarea
            className="about-input"
            placeholder="Tell us about yourself..."
            value={aboutText}
            onChange={handleAboutChange}
          ></textarea>
        </div>
        <div className="my-items">My Items</div>
        <h2>My Items</h2>
        <div className="my-items-container">
         
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.productID} product={product} />  // Using product.productID as the key
            ))
          ) : (
            <p>No products found. <a href="/uploadproduct" style={{ color: 'blue', textDecoration: 'underline' }}>Add some items!</a></p>
          )}
        </div>

                <div className="main-content">
                  {/* Additional content here */}
                </div>
              </div>
            </div>
  );
};

export default UserProfile;
