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

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let apiUrl;
        
        if (convoID) {
          // Case 2: Only convoID is present
          apiUrl = `https://0z3s33sr47.execute-api.eu-north-1.amazonaws.com/default/fetchmessages?convo_id=${convoID}`;
        } else if (recipientId && productID) {
          // Case 1: Full info is present
          apiUrl = `https://0z3s33sr47.execute-api.eu-north-1.amazonaws.com/default/fetchmessages?user_id=${userId}&recipient_id=${recipientId}&product_id=${productID}`;
        }

        if (apiUrl) {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (!response.ok) throw new Error('Failed to fetch messages');

          const data = await response.json();
          console.log(data)
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId, recipientId, convoID, accessToken]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    const messageData = {
      user_id: userId,
      recipient_id: recipientId,
      message: newMessage,
      ProductId: ProductID
    };
    console.log(messageData)
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
