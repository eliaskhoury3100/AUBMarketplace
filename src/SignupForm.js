// src/components/SignUpForm.js

import React, { useState, useEffect } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom

const SignUpForm = () => {
  // Define state variables for form fields and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);  // Add loading state



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
    // Reset errors
    setEmailError('');
    setFormError('');

    // Validate the email field
    if (!email.endsWith('@mail.aub.edu')) {
      setEmailError('Email must end with @mail.aub.edu');
      return;
    }

    // Validate password and confirm password fields
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    const profilepicture= 'https://marketplacepictures.s3.eu-north-1.amazonaws.com/s3.png'
    // Prepare the request body
    const requestBody = { email, password, confirmPassword, profilepicture  };
    console.log("Request Body:", JSON.stringify(requestBody));

    // Set loading state to true and start the sign-up process
    setLoading(true);

    try {
      const response = await fetch('https://1f756dhgyb.execute-api.eu-north-1.amazonaws.com/Project/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),  // Send requestBody as JSON
      });

      if (response.ok) {
        const data = await response.json();
        const { username } = data;  // Get UserSub from the response
        console.log(username);
        // Navigate to the verification page with the username as state
        navigate('/verify', { state: { username: username } });
      } else {
        const data = await response.json();
        setFormError(data.error || 'An error occurred');
      }
    } catch (error) {
      setFormError('An error occurred');
    } finally {
      // Reset the loading state to false after the request is done
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit} id="signUpForm">
        {formError && (
          <div className="alert alert-danger">
            <ul style={{ color: 'red' }}>
              <li>{formError}</li>
            </ul>
          </div>
        )}
        <h2>Welcome!</h2>
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
        <div className="input-field">
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="password">Enter your password</label>
        </div>
        <div className="input-field">
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label htmlFor="confirm_password">Re-enter your password</label>
        </div>
        <button type="submit" disabled={loading}>  {/* Disable the button while loading */}
          {loading ? 'Signing Up...' : 'Sign Up'}  {/* Show loading state */}
        </button>
        <div className="login">
          <p>Already have an account? <a href="/">Login</a></p>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
