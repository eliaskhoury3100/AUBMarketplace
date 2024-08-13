// src/components/EmailVerificationForm.js

import React, { useState, useEffect } from 'react';
import './style.css';
import { useNavigate, useLocation } from 'react-router-dom';

const EmailVerificationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the username (email) from location.state
  const { username } = location.state || {};
  const [verificationCode, setVerificationCode] = useState('');
  const [formError, setFormError] = useState('');

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

  // Form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');  // Reset form error

    // Check if username and verification code are provided
    if (!username) {
      setFormError('Username is required');
      return;
    }

    if (!verificationCode) {
      setFormError('Verification code is required');
      return;
    }

    // Prepare the request body
    const requestBody = { Username: username, verification_code: verificationCode };
    console.log("Request Body:", JSON.stringify(requestBody));

    try {
      const response = await fetch('https://ije64c8epj.execute-api.eu-north-1.amazonaws.com/Project/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
      
        navigate('/login');  // Redirect to the login page or another page
      } else {
        const data = await response.json();
        setFormError(data.error || 'An error occurred');
      }
    } catch (error) {
      setFormError('An error occurred');
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit} id="emailVerificationForm">
        <h2>Email Verification</h2>
        {formError && (
          <div className="alert alert-danger">
            <ul style={{ color: 'red' }}>
              <li>{formError}</li>
            </ul>
          </div>
        )}
        <div className="input-field">
          <input
            type="text"
            id="verification_code"
            name="verification_code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <label htmlFor="verification_code">Enter Verification Code:</label>
        </div>
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default EmailVerificationForm;
