import React, { useState, useEffect } from 'react';
import './ConversationPage.css';

const ConversationPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('username');
      const userApiUrl = `https://tv6a49ucmd.execute-api.eu-north-1.amazonaws.com/default/retreivelistofusers?userId=${userId}`;

      try {
        const userResponse = await fetch(userApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsers(userData); // Assuming the API returns an array of users
          console.log("Users data fetched successfully:", userData);
        } else {
          throw new Error(`Failed to fetch users data: ${userResponse.status}`);
        }
      } catch (error) {
        console.error('Error fetching users data:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (username) => {
    window.location.href = `/messages?recipient=${username}`;

  };

  return (
    <div className="message-page">
      <header className="header">
        <div className="logo">
          <img src="images/logo.png" alt="Logo" />
        </div>
        <img className="profile-pic" src="images/profile.jpg" alt="Profile" />
      </header>
      <div className="search-bar">
        <input type="text" placeholder="Search" />
      </div>
      <main className="messages-list">
        {users.map((user, index) => (
          <div className="user-item" key={index} onClick={() => handleUserClick(user)}>
            <div className="user-avatar"></div>
            <div className="user-name">{user}</div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ConversationPage;
