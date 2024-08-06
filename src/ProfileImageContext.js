import React, { createContext, useContext, useState } from 'react';

const ProfileImageContext = createContext({
  profileImage: '', // initial state
  setProfileImage: () => {}  // method to update state
});

export const useProfileImage = () => useContext(ProfileImageContext);

export const ProfileImageProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState('');
  
  return (
   
    <ProfileImageContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </ProfileImageContext.Provider>
  );
};
