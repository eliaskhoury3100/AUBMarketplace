import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MessagingPage.css'; // Make sure this is correctly imported

const MessagingPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const userId = localStorage.getItem('username');
  const urlParams = new URLSearchParams(window.location.search);
  const recipientId = urlParams.get('sellerID');
  const productName = urlParams.get('name');
  const productPrice = urlParams.get('price');
  const productImage = urlParams.get('image');
  const accessToken = localStorage.getItem('accessToken');
  const ProductID =urlParams.get('productID')
  const ConvoID= urlParams.get("convoId")
  const convoID= encodeURIComponent(ConvoID)
  const productID= encodeURIComponent(ProductID)
  console.log(ProductID)
  console.log(userId)
  console.log(recipientId)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let apiUrl;

        // Prioritize using userId, recipientId, and productID
        if (userId && recipientId && productID) {
          // Case 1: Full info is present, use this first
          apiUrl = `https://0z3s33sr47.execute-api.eu-north-1.amazonaws.com/default/fetchmessages?user_id=${userId}&recipient_id=${recipientId}&product_id=${productID}`;
        } else if (convoID) {
          // Case 2: Only convoID is present
          apiUrl = `https://0z3s33sr47.execute-api.eu-north-1.amazonaws.com/default/fetchmessages?convo_id=${convoID}`;
        } else {
          console.error('Required parameters are missing.');
          return; // Stop the function if all are missing
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch messages');

        const data = await response.json();
        console.log(data);
        setMessages(data); // Access the Messages array directly
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId, recipientId, convoID, productID, accessToken]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
  
    let messageData;
  
    if (ProductID) {
      // If ProductID is not null, send the full messageData including ProductId
      messageData = {
        user_id: userId,
        recipient_id: recipientId,
        message: newMessage,
        ProductId: ProductID
      };
    } else if (ConvoID) {
      // If ProductID is null, send only the convo_id
      messageData = {
        convo_id: ConvoID
      };
    } else {
      console.error('Both ProductID and ConvoID are missing.');
      return; // Stop the function if both are missing
    }
  
    console.log(messageData);
  
    try {
      const response = await fetch('https://7upb1xno37.execute-api.eu-north-1.amazonaws.com/default/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(messageData)
      });
  
      if (response.ok) {
        const updatedMessages = [...messages, { SenderID: userId, Message: newMessage }];
        setMessages(updatedMessages);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  
    setNewMessage('');
  };
  

  return (
    <div className="message-page">
      <header className="header">
        <Link to="/conversations" className="back-link">&lt;</Link>
        <span className="username">{recipientId}</span>
      </header>
      <div className="product-info-section">
        <div className="product-info">
          <img src={productImage} alt={productName} />
          <div className="product-details">
            <div className="product-title">{productName}</div>
            <div className="product-price"> ${productPrice} </div>
          </div>
        </div>
      </div>
      <main className="messages-list">
        {messages.map((message, index) => (
          <div className={`message ${message.SenderID === userId ? 'sent' : 'received'}`} key={index}>
            <div className="message-text">{message.Message}</div>
          </div>
        ))}
      </main>
      <form onSubmit={handleSendMessage} className="message-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="inputfield1"
        />
    
      </form>
      
    </div>
  );
};

export default MessagingPage;
