import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const { sub } = useParams(); // Get the 'sub' parameter from the URL, if it exists
  const [aboutText, setAboutText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [tempNickname, setTempNickname] = useState('');
  const [dob, setDob] = useState('');
  const [major, setMajor] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [message, setMessage] = useState('');
  const [imageUpdated, setImageUpdated] = useState(false);
  const [products, setProducts] = useState([]); // Define products state
  const [isOwnProfile, setIsOwnProfile] = useState(false); // State to track if viewing own profile

  const editButtonRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadButtonRef = useRef(null);

  const loggedInUserId = localStorage.getItem('userId'); // Logged-in user's ID
  const userId = sub || loggedInUserId; // Use the 'sub' parameter if it exists, otherwise use logged-in user's ID

  useEffect(() => {
    if (sub) {
      setIsOwnProfile(false); // Viewing another user's profile
    } else {
      setIsOwnProfile(true); // Viewing own profile
    }

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
          setUsername(userData['email'].split('@')[0]); // Extract username
          setNickname(userData['custom:Nickname'] || '');
          setDob(userData['custom:DOB'] || '');
          setMajor(userData['custom:Major'] || '');
          setProfileImage(userData['custom:ProfilePicture']);
          setAboutText(userData['custom:AboutYou'] || '');
          console.log("User data fetched successfully:", userData);
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [userId, sub]);

  useEffect(() => {
    const fetchProducts = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !userId) {
        console.error('Access token or userId not found. Please log in again.');
        return;
      }

      const apiUrl = `https://f7lm737rz9.execute-api.eu-north-1.amazonaws.com/default/retreiveProducts?userId=${userId}`;

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

  // Define the ProductCard component used to display each product
  const ProductCard = ({ product }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleDotClick = (index) => {
      setActiveIndex(index);
    };

    return (
      <div className="productcard1">
        <Link to={`/productdetail/${sk}/${pk}`} className="product-card-link">
          <div className="imagecarousel1">
              {product.ImageUrl && product.ImageUrl.length > 0 && (
                  <img src={product.ImageUrl[activeIndex]} alt={`Product ${product.Title} Image`} className="productimage" />
              )}
          </div>
          
          <div className="productinfo1">
              <h3>{product.Title}</h3>
              <p>${product.Price}</p>
          </div>
        </Link>
      </div>

    );
  };

  const handleEditProfileClick = async () => {
    if (!isOwnProfile) return; // Do not allow editing if viewing another user's profile

    if (isEditing) {
      setNickname(tempNickname);
      const profileData = {
        userId: loggedInUserId,
        nickname: tempNickname,
        dob: dob,
        major: major,
        aboutText: aboutText,
      };
      if (imageUpdated) {
        profileData.profileImage = profileImage;
      }

      console.log(profileData);
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
        setImageUpdated(false);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        setMessage(error.message || 'Failed to update profile');
      }
    } else {
      setTempNickname(nickname);
      setIsEditing(true);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        setProfileImage(base64String);
        setImageUpdated(true);
      };
      reader.onerror = (error) => console.error('Error reading file:', error);
    }
  };

  const handleDeleteProfileImage = async () => {
    const defaultImageUrl = 'https://marketplacepictures.s3.eu-north-1.amazonaws.com/s3.png';  // Update with your actual URL
    const profileData = {
      userId: loggedInUserId,
      profileImage: defaultImageUrl,  // Set to default image URL
    };
    console.log(profileData);
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
      console.log('Profile image reset successfully:', responseData);
      setProfileImage(defaultImageUrl);  // Update local state to reflect the default image
      setMessage('Profile image reset to default successfully.');
    } catch (error) {
      console.error('Error resetting profile image:', error);
      setMessage(error.message || 'Failed to reset profile image');
    }
  };

  const triggerFileSelect = () => {
    if (!isOwnProfile) return; // Do not allow changing profile image if viewing another user's profile
    fileInputRef.current.click();
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <div className="user-profile-container">
      <div className="top-section">
        <div className="profile-header-container">
          <div className="profile-image-wrapper">
            <img
              src={profileImage ? (profileImage.startsWith('http') ? profileImage : `data:image/jpeg;base64,${profileImage}`) : ''}
              alt="Profile"
              className="profile-image"
              onError={(e) => { e.target.onerror = null; e.target.src='https://marketplacepictures.s3.eu-north-1.amazonaws.com/s3.png'; }}
            />
          </div>
          <div className="profile-text">
            <div className="username">{username}</div>
            <div className="nickname">{nickname}</div>
            <div className="major">{major}</div>
          </div>
        </div>
      </div>

      <div className="edit-section">
        <div className="actions-container">
          {isOwnProfile && (
            <>
              <button
                className="action-button"
                onClick={handleEditProfileClick}
                ref={editButtonRef}
                style={{ backgroundColor: '#f1e4e7', color: 'black' }}
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>

              <button className="sign-out-button" onClick={handleSignOut}>
                Log Out
              </button>

              <button className="delete-button" /*onClick={handleSignOut}*/>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isOwnProfile && isEditing && (
        <div className="edit-form">
          <label htmlFor="nickname">Nickname</label>
          <input
            id="nickname"
            type="text"
            placeholder="Enter a nickname"
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            className="form-input"
          />

          <label htmlFor="major">Major</label>
          <input
            id="major"
            type="text"
            placeholder="Enter your major"
            /*value={tempNickname}*/
            /*onChange={(e) => setTempNickname(e.target.value)}*/
            className="form-input"
          />

          <button className="upload-button" onClick={triggerFileSelect} ref={uploadButtonRef}>
            Upload Profile Image <span className="plus-icon">+</span>
          </button>

          <button className="upload-button" onClick={handleDeleteProfileImage}>
            Delete Profile Image <span className="minus-icon">-</span>
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
        <div className="aboutText">
          {isOwnProfile ? 'About You' : `About ${nickname || username}`}
        </div>
        <textarea
          className="about-input"
          placeholder={isOwnProfile ? "Tell us about yourself..." : `About ${nickname || username}...`}
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          disabled={!isOwnProfile} // Disable editing if viewing another user's profile
        ></textarea>
      </div>

      <div className="my-items">
        {isOwnProfile ? 'My Items' : `${nickname || username}'s Items`}
      </div>
      <div className="my-items-container">
        {products.length > 0 ? (
          products.map((product) => <ProductCard key={product.productID} product={product} />)
        ) : (
          <p>
            No products found. <a href="/uploadproduct" style={{ color: 'blue', textDecoration: 'underline' }}>Add some items!</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
