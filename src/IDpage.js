import React, { useState } from 'react';
import './IDPage.css';
import { Link } from 'react-router-dom'; 
function LostIDsPage() {
    const [name, setName] = useState('');
    const [initials, setInitials] = useState('');
    const [phone, setPhone] = useState('');
    const [finderName, setFinderName] = useState('');
    const [comments, setComments] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission status
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true); // Set submitting state to true when API call starts

        // Create a data object that only includes non-empty fields
        const data = {};
        if (name) data.name = name;
        if (initials) data.initials = initials;
        if (phone) data.phone = phone;
        if (finderName) data.finderName = finderName
        if (comments) data.comments = comments;
        console.log(data)
        const accessToken = localStorage.getItem('accessToken');
        try {
            const response = await fetch('https://irve6eijy1.execute-api.eu-north-1.amazonaws.com/default/lostid-upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to submit data');
            }
            setMessage('Form submitted successfully!');
            setMessageType('success');

            setTimeout(() => {
                setMessage('');
                setMessageType('');
              }, 5000); // 5000 milliseconds = 5 seconds
            const result = await response.json();
            console.log('Submission successful:', result);
            // Further actions based on the result (e.g., show a success message, redirect, etc.)
            setName('');
            setInitials('');
            setPhone('');
            setComments('');
            setFinderName('')

        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('Failed to submit data');
        } finally {
            setIsSubmitting(false); // Reset submitting state once API call is complete
        }
    };

    return (
    <div className="selling1">
  <nav className="uppernav1">
    <div className="navitem">
      <Link to="/homepage" className="back-link">
        <i className="fas fa-arrow-left back-icon"></i>
      </Link>
    </div>
    <h1 className="nav-title">Lost ID?</h1>
  </nav>


        
<p class="page-description">Found a lost ID? Fill the form below. We'll find the owner and let them contact you!</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter the full name, as seen on the ID"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="finder-name">Your Name (Optional)</label>
                    <input
                        type="text"
                        id="finderName"
                        name="finderName"
                        placeholder="Enter your name"
                        value={finderName}
                        onChange={(e) => setFinderName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number (Optional)</label>
                    <input
                        type="number"
                        id="phone"
                        name="phone"
                        placeholder="Enter your contact phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="comments">Comments</label>
                    <textarea
                        id="comments"
                        name="comments"
                        placeholder="Will the ID be dropped at some office or kept with you?..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>
                <button type="submit" className="post-button" style={{ backgroundColor: '#3d3d3d' }} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'REPORT ID'}
                </button>
                {errorMessage && <p className="message-error">{errorMessage}</p>}
            </form>
            {message && (
      <p className={messageType === 'success' ? 'success-message' : 'error-message'}>
        {message}
      </p>
    )}
        </div>
    );
}

export default LostIDsPage;
