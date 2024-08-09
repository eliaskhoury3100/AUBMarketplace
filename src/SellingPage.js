import React, { useState, useRef } from 'react';
import './SellingPage.css';

const CategoriesPage = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const postButtonRef = useRef(null);



  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);  // Get content part of base64
    reader.onerror = error => reject(error);
  });

  const handleFileChange = async (event) => {
    const filesToAdd = Array.from(event.target.files);
    if (selectedFiles.length + filesToAdd.length > 6) {
      alert('You can only upload a maximum of 6 images.');
      return;
    }
    const filesWithBase64 = await Promise.all(filesToAdd.map(file => toBase64(file).then(content => ({
      name: file.name,
      content
    }))));
    setSelectedFiles([...selectedFiles, ...filesWithBase64].slice(0, 6));
  };

  // Assuming postButtonRef is already defined and attached to your "POST" button
const handlePostButtonClick = () => {
  setTimeout(() => {
    if (postButtonRef.current) {
      postButtonRef.current.focus();
      postButtonRef.current.style.backgroundColor = '#3d3d3d'; // Use a darker color for visibility
    }
  }, 0);
};




  const handleSubmit = async (event) => {
  
  event.preventDefault();
  setIsSubmitting(true);
  const userId= localStorage.getItem('username'); // Retrieve the access token from local storage
  const accessToken = localStorage.getItem('accessToken'); // Retrieve the access token from local storage
  if (!accessToken) {
    setMessage('You are not authenticated. Please login.');
    setIsSubmitting(false);
    return;
  }

  const requestBody = {
    userId,
    name, 
    description, 
    condition, 
    currency, 
    price, 
    category, 
    files: selectedFiles
  };

  try {
    const response = await fetch('https://tuo6ab9fx3.execute-api.eu-north-1.amazonaws.com/uploadproduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // Include the access token in the Authorization header
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
   
    if (response.ok) {
      // Clear fields after successful submission
      setName('');
      setDescription('');
      setCondition('');
      setPrice('');
      setCurrency('USD');
      setCategory('');
      setSelectedFiles([]);
      setTermsAccepted(false)
      setMessage('Product uploaded successfully!');
    } else {
      throw new Error(result.message || 'Failed to upload product due to server error');
    }
   
    // Clear message after 5 seconds
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage('');
    }, 10000);

  } catch (error) {
    console.error('Error uploading product:', error);
    setMessage(error.message || 'Failed to upload product');
  }
  finally {
    setIsSubmitting(false);
  }
};


  const renderImagePreviews = () => (
    <div className="image-previews-container">
      {selectedFiles.length > 0 ? (
        selectedFiles.map((file, index) => (
          <div key={index} className="image-preview">
            <img src={`data:image/jpeg;base64,${file.content}`} alt={`preview ${index}`} />
            <button onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))} className="remove-image">×</button>
          </div>
        ))
      ) : (
        <p className="no-images-text">No images added yet.</p>
      )}
    </div>
  );

  return (
    <div className="selling">
      <div className="header">
        
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name of product</label>
          <input type="text" id="name" name="name" placeholder="Enter name of product" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select a category</option>
            
            <optgroup label="Electronics">
              <option value="mobile_phones_accessories">Mobile Phones & Accessories</option>
              <option value="laptops_tablets">Laptops & Tablets</option>
              <option value="computers_parts">Computers & Computer Parts</option>
              <option value="gaming_consoles_games">Gaming Consoles & Video Games</option>
              <option value="tv">TV</option>
              <option value="speakers">Speakers</option>
              <option value="cameras">Cameras</option>
            </optgroup>

            <optgroup label="Fashion">
              <option value="clothing_men">Clothing for Men</option>
              <option value="accessories_men">Accessories for Men</option>
              <option value="clothing_women">Clothing for Women</option>
              <option value="accessories_women">Accessories for Women</option>
              <option value="makeup_cosmetics">Makeup and Cosmetics</option>
              <option value="jewelry">Jewelry</option>
              <option value="watches">Watches</option>
              <option value="shoes">Shoes</option>
            </optgroup>

            <optgroup label="Sports & Outdoors">
              <option value="sports_wear_men">Sports Wear for Men</option>
              <option value="sports_wear_women">Sports Wear for Women</option>
              <option value="sports_equipment">Sports Equipment</option>
            </optgroup>

            <optgroup label="Entertainment & Hobbies">
              <option value="musical_instruments_gear">Musical Instruments & Gear</option>
              <option value="books">Books</option>
              <option value="music_movies">Music & Movies</option>
              <option value="stationery">Stationery</option>
            </optgroup>

          </select>

        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" placeholder="Add a description" rows="4" maxLength="500" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        </div>
        <div className="form-group">
          <label className="bold-label">Upload Images</label>
          <button type="button" onClick={() => document.getElementById('fileUpload').click()} className="upload-trigger">+</button>
          <input type="file" id="fileUpload" style={{ display: 'none' }} multiple onChange={handleFileChange} accept="image/*" />
          {renderImagePreviews()}
        </div>
        <div className="form-group">
          <label htmlFor="condition">Condition</label>
          <select id="condition" name="condition" value={condition} onChange={(e) => setCondition(e.target.value)} required>
            <option value="">Select condition</option>
            <option value="new">New</option>
            <option value="Slightly Used">Slightly Used</option>
            <option value="Moderately Used">Moderately Used</option>
            <option value="Heavily Used">Heavily Used</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="price">Price (USD)</label>
          <input type="text" id="price" name="price" placeholder="Enter price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="formgroupalone">
          <label htmlFor="termsCheckbox" className="checkbox-label" style={{ fontStyle: 'italic', fontSize: '14px' }}>
            <input
              type="checkbox"
              id="termsCheckbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ marginRight: '20px' }}
            />
            I agree to the terms and conditions.
          </label>
        </div>
        <button 
            type="submit" 
            className="post-button" 
            disabled={!termsAccepted || isSubmitting}
            ref={postButtonRef}
            onClick={handlePostButtonClick}
            style={{ backgroundColor: '#3d3d3d' }}
          >
            {isSubmitting ? 'Posting...' : 'POST'}
          </button>


       

      </form>
      {message && (
            <p className={message.includes('successfully') ? 'message-success' : 'message-error'}>
                {message}
            </p>)}
    </div>
    
  );
};

export default CategoriesPage;
