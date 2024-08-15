import React, { useState, useEffect } from 'react';
import './style.css';

const LoginForm = () => {
  // State hooks for form fields, errors, and loading
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false); // Added remember state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  // Added loading state

  useEffect(() => {
    document.body.style.backgroundImage = "url('https://marketplacepictures.s3.eu-north-1.amazonaws.com/loginbackgroundcompressed.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center center";

    // Reset background when component unmounts
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
    };
  }, []);
  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);  // Set loading to true while the request is being processed
  
    // Basic validation for form fields
    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch('https://cbb1r8qokl.execute-api.eu-north-1.amazonaws.com/Project/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, remember }),  // Send email, password, and remember
      });
  
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        // Assume the server response includes tokens in a property named "authResult"
        const { accessToken, refreshToken, userId } = data.authResult;
  
        // Store tokens in local storage
        localStorage.setItem('accessToken', accessToken);
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
  
        const username = email.substring(0, email.indexOf('@'));
        localStorage.setItem('username', username);  // Store the username in local storage

        if (userId) {
          localStorage.setItem('userId', userId);
        }
  
        // Redirect to home page or another route upon successful login
        window.location.href = '/homepage';
      } else {
        // Handle any errors that might occur during login
        setError(data.error || 'An error occurred during login');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setError('An error occurred during login');
    } finally {
      setLoading(false);  // Set loading to false after the request completes or fails
    }
  };
  

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <h2 style={{ textAlign: 'center', fontSize: '18px' }}>Welcome to AUB MarketPlace</h2>
        <div className="input-field">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Enter your email</label>
        </div>
        <div className="input-field">
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>Enter your password</label>
        </div>
        <div className="forget">
          <a href="/forgotpassword">Forgot password?</a>
        </div>
        <button type="submit" disabled={loading}>  {/* Disable the button while loading */}
          {loading ? 'Logging In...' : 'Log In'}  {/* Show loading state */}
        </button>
        <div className="login">
          <p>Don't have an account? <a href="/signup">Register</a></p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
