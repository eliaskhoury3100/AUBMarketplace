import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MessagingPage.css';

const MessagingPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [productDetails, setProductDetails] = useState(null); // State to store product details
  const userId = localStorage.getItem('username');
  const urlParams = new URLSearchParams(window.location.search);
  const recipientId = urlParams.get('sellerID');
  const productName = urlParams.get('name');
  const productPrice = urlParams.get('price');
  const productImage = urlParams.get('image');
  const accessToken = localStorage.getItem('accessToken');
  const ProductID = urlParams.get('productID')
  const ConvoID = urlParams.get("convoId")
  const otherParticipant= urlParams.get('otheruser')
  const convoID = encodeURIComponent(ConvoID)
  const productID = encodeURIComponent(ProductID)

  useEffect(() => {
    const fetchMessages = async () => {
      let apiUrl = ProductID ?
        `https://0z3s33sr47.execute-api.eu-north-1.amazonaws.com/default/fetchmessages?user_id=${userId}&recipient_id=${recipientId}&product_id=${productID}` :
        `https://0z3s33sr47.execute-api.eu-north-1.amazonaws.com/default/fetchmessages?convo_id=${convoID}`;

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch messages');

        const data = await response.json();
        setMessages(data);
        if (data.length > 0 && data[0].ProductID) {
          fetchProductDetails(data[0].ProductID);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId, recipientId, convoID, productID, accessToken]);

  // Function to fetch product details
  const fetchProductDetails = async (productId) => {
    const PRODUCTID = encodeURIComponent(productId)
    const apiUrl = `https://0bt2c4ahy9.execute-api.eu-north-1.amazonaws.com/default/retreiveProductInfoforConversation?product_id=${PRODUCTID}`;
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
      });
      const productData = await response.json();
      setProductDetails(productData);
      console.log(productData)
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
  
    const messageData = ProductID ? {
      user_id: userId,
      recipient_id: recipientId,
      message: newMessage,
      ProductId: ProductID,
    } : {
      convo_id: ConvoID,
      message: newMessage,
      user_id: userId
    };
  
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
    } finally {
      setNewMessage('');
    }
  };
  
  return (
    <div className="message-page">
      <header className="header">
        <Link to="/conversations" className="back-link">&lt;</Link>
        <span className="username">{recipientId || otherParticipant.split('@')[0]}</span>

      </header>
      <div className="product-info-section">

          <div className="product-info1">
          <img src={productImage || productDetails?.ImageUrl[0]} alt={productName || productDetails?.Title} />
  <div className="product-details">
    <div className="product-title">{productName || (productDetails && productDetails.Title)}</div>
    <div className="product-price"> ${productPrice || (productDetails && productDetails.Price)} </div>
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
      <div className="message-container">
  <form onSubmit={handleSendMessage} className="message-input">
    <input
      type="text"
      placeholder="Type a message..."
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      className="inputfield1"
    />
    <button type="submit" className="send-button">
      <i className="fas fa-paper-plane"></i>
    </button>
  </form>
</div>

</div>
  );
};

export default MessagingPage;
