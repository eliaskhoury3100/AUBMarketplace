import React from 'react';
import './ConversationPage.css'; // Correct CSS file import

const ConversationPage = () => {
  const users = ["Lama", "Hadi", "Elias", "Tia", "Ahmad", "Miriam"];

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
          <div className="user-item" key={index}>
            <div className="user-avatar"></div>
            <div className="user-name">{user}</div>
          </div>
        ))}
      </main>
      <nav className="nav-bar">
        <a href="#"><img src="images/home-icon.png" alt="Home" /><span>Home</span></a>
        <a href="#"><img src="images/sell-icon.png" alt="Sell" /><span>Sell</span></a>
        <a href="#" className="active"><img src="images/messages-icon.png" alt="Messages" /><span>Messages</span></a>
        <a href="#"><img src="images/profile-icon.png" alt="Profile" /><span>Profile</span></a>
      </nav>
    </div>
  );
};

export default ConversationPage;
