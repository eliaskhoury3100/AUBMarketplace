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
          const filteredConversations = data.filter(conversation => 
            !(conversation.ProductDetails && conversation.ProductDetails === "No product details found")
          );
          setConversations(filteredConversations);
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

  function formatDateOrTime(lastUpdated) {
    const date = new Date(lastUpdated);
    const today = new Date();
    
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Show time if today
    } else {
        return date.toLocaleDateString(); // Show date if not today
    }
}


  const handleUserClick = (convoId, otherparticipant) => {
    const encodedConvoId = encodeURIComponent(convoId);
    const encodedOtherParticipant = (otherparticipant);
    window.location.href = `/messages?convoId=${encodedConvoId}&otheruser=${encodedOtherParticipant}`;
  };
  
  return (
    <div className="message-page">

      <div className="topsection">
        <nav className="uppernav">
          
          <h1>Conversations</h1>
        </nav>
      </div>
      
      <main className="messages-list">
      {conversations.map((conversation, index) => (
      <div className="user-item" key={index} onClick={() => handleUserClick(conversation.ConversationID, conversation.OtherParticipant)}>
      <img 
          className="user-image" 
          src={conversation.ProfilePictureURL ? conversation.ProfilePictureURL : 'fallback-image-url.jpg'} 
          alt="User Profile"
      />
  
      <div className="user-info">
          <div className="user-name">
              {conversation.OtherParticipant.split("@")[0] ? conversation.OtherParticipant.split('@')[0] : 'Unknown User'}
          </div>
          {conversation.ProductDetails && (
              <div className="product-info">
                  <span>$ {conversation.ProductDetails.Price}</span>
                  <div className="product-image" style={{ backgroundImage: `url(${conversation.ProductDetails.ImageUrl[0]})` }}></div>
              </div>
          )}
          <div className="last-updated">
              {formatDateOrTime(conversation.LastUpdated)}
          </div>
      </div>
  </div>
  
))}

      </main>
    </div>
  );
};

export default ConversationPage;
