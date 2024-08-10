import React, { useState, useEffect } from 'react';
import './ConversationPage.css';

const ConversationPage = () => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('username');
      const apiUrl = `https://tv6a49ucmd.execute-api.eu-north-1.amazonaws.com/default/retreivelistofusers?userId=${userId}`;

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setConversations(data);
          console.log("Conversations fetched successfully:", data);
        } else {
          throw new Error(`Failed to fetch conversations: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  const handleUserClick = (convoId) => {
    const encodedConvoId = encodeURIComponent(convoId);  // Use a different variable name
    window.location.href = `/messages?convoId=${encodedConvoId}`;
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
      {conversations.map((conversation, index) => (
  <div className="user-item" key={index} onClick={() => handleUserClick(conversation.ConversationID)}>
     <img 
      className="user-image" 
      src={conversation.ProfilePictureURL ? conversation.ProfilePictureURL : 'fallback-image-url.jpg'} 
      alt="User Profile"
    />

    <div className="user-info">
    <div className="user-name">
      {conversation.OtherParticipant ? conversation.OtherParticipant.split('@')[0] : 'Unknown User'}
    </div>
      {conversation.ProductDetails && (
        <div className="product-info">
          <span>$ {conversation.ProductDetails.Price}</span>
          <div className="product-image" style={{ backgroundImage: `url(${conversation.ProductDetails.ImageUrl[0]})` }}></div>
        </div>
      )}
    </div>
  </div>
))}

      </main>
    </div>
  );
};

export default ConversationPage;
