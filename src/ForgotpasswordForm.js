// src/components/ForgotPasswordForm.js

import React, { useState, useEffect } from 'react';
import './style.css';  // Import the CSS file for styling
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');

  // Initialize useNavigate hook
  const navigate = useNavigate();

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
    setEmailError('');
    setFormError('');

    // Validate the email field
    if (!email.endsWith('@mail.aub.edu')) {
      setEmailError('Email must end with @mail.aub.edu');
      return;
    }

    // Prepare the request body
    const requestBody = { email };
    console.log("Request Body:", JSON.stringify(requestBody));

    try {
      const response = await fetch('https://zverhoi719.execute-api.eu-north-1.amazonaws.com/Project/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),  // Send requestBody as JSON
      });

      if (response.ok) {
        // Redirect to the forgot password confirmation page upon success
        navigate('/resetpassword', { state: { username: email } });
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
      <form onSubmit={handleSubmit} id="forgotPasswordForm">
        <h2>Forgot Password</h2>
        {formError && (
          <div className="alert alert-danger">
            <ul style={{ color: 'red' }}>
              <li>{formError}</li>
            </ul>
          </div>
        )}
        <div className="input-field">
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="email">Enter your AUB-email</label>
          {emailError && <p id="email-error" style={{ color: 'red' }}>{emailError}</p>}
        </div>
        <button type="submit">Submit</button>
        <div className="login">
          <p>Remember your password? <a href="/">Login</a></p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
