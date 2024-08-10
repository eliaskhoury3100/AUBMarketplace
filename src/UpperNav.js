import React, { useState, useEffect } from 'react';
import './UpperNav.css';

const UpperNav = () => {
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
              const imageUrl = userData['custom:ProfilePicture'] || '';
              if (imageUrl) {
                setProfileImage(imageUrl); // Appending timestamp to force browser to reload image
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
    
      }, []);

    return (
        <nav className="upper-nav">
            <div className="nav-item">
                <img src={'https://marketplacepictures.s3.eu-north-1.amazonaws.com/logo.png'} alt="Website Logo" className="nav-logo"/>
            </div>
            <div className="nav-item profile-container">
                <img src={profileImage} alt="Profile" className="profile-picture" />
            </div>
        </nav>
    );
};

export default UpperNav;
