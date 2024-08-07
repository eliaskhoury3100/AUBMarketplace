import React from 'react';
import './MessagingPage.css'; // Ensure this matches the actual path

const MessagingPage = () => {
  const messages = [
    { type: 'sent', image: 'images/winter-coat.png', text: 'Hello! I would like to purchase this item' },
    { type: 'received', text: 'Hello! yes, of course' },
    { type: 'received', text: 'I can give you the item this week. Can you provide me with the times you’re available?' },
    { type: 'sent', text: 'I can do Wednesday at 1:30 pm. Would that work?' },
    { type: 'received', text: 'Perfect! Would Wednesday at 1:30 pm in front of West Hall work?' },
    { type: 'sent', text: 'Yes! That would be great. I’ll text you if I can’t find you.' },
    { type: 'received', text: 'Deal! It’s going to be 20$ as the post says. Thank you for your purchase!' },
  ];

  return (
    <div className="message-page">
      <header className="header">
        <div className="user-info">
          <div className="user-name">← user</div>
        </div>
        <img className="profile-pic" src="images/profile.jpg" alt="Profile" />
      </header>
      <div className="product-info">
        <img src="images/winter-coat.png" alt="Product"/>
        <div className="product-details">
          <div className="product-title">Winter Coat</div>
        </div>
      </div>
      <main className="messages-list">
        {messages.map((message, index) => (
          <div className={`message ${message.type}`} key={index}>
            <div className="message-text">{message.text}</div>
          </div>
        ))}
      </main>
      <nav className="nav-bar">
        <a href="#"><img src="images/home-icon.png" alt="Home" /></a>
        <a href="#"><img src="images/sell-icon.png" alt="Sell" /></a>
        <a href="#" className="active"><img src="images/messages-icon.png" alt="Messages" /></a>
        <a href="#"><img src="images/profile-icon.png" alt="Profile" /></a>
      </nav>
    </div>
  );
};

export default MessagingPage;
