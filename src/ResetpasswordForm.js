// src/components/ResetPasswordForm.js

import React, { useState, useEffect } from 'react';
import './style.css';  // Import the CSS file for styling
import { useLocation } from 'react-router-dom';  // Import useLocation from react-router-dom

const ResetPasswordForm = () => {
  const location = useLocation();
  const { username } = location.state || {};  // Get the email from the location state
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    setFormError('');
    setSuccessMessage('');

    // Validate the form inputs
    if (!verificationCode) {
      setFormError('Verification code is required');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    // Prepare the request body
    const requestBody = { username, verificationCode, password, confirmPassword };
    console.log("Request Body:", JSON.stringify(requestBody));

    try {
      const response = await fetch('https://jqz0btoi3a.execute-api.eu-north-1.amazonaws.com/Project/resetpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),  // Send requestBody as JSON
   
      });

      if (response.ok) {
        setSuccessMessage('Password has been reset successfully');
        window.location.href = '/login';
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
      <form onSubmit={handleSubmit} id="resetPasswordForm">
        {successMessage && (
          <div className="alert alert-success">
            <ul style={{ color: 'green' }}>
              <li>{successMessage}</li>
            </ul>
          </div>
        )}
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
            name="verificationCode"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <label htmlFor="verificationCode">Verification Code</label>
        </div>
        <div className="input-field">
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="password">New Password</label>
        </div>
        <div className="input-field">
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
        </div>
        <button type="submit">Reset Password</button>
        <div className="login">
          <p>Remember your password? <a href="/">Login</a></p>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
