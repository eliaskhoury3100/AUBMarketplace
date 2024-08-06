import React from 'react';
import './UpperNav.css';
import { useProfileImage } from './ProfileImageContext';

const UpperNav = () => {
    const { profileImage } = useProfileImage();

    return (
        <nav className="upper-nav">
            <div className="nav-item">
                <img src={'https://marketplacepictures.s3.eu-north-1.amazonaws.com/logo.png'} alt="Website Logo" className="nav-logo"/>
            </div>
            <div className="nav-item">
      
            </div>
        </nav>
    );
};

export default UpperNav;
