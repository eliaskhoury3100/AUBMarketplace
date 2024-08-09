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
  const [size, setSize] = useState('');  // Added size state for conditional input
  const [warranty, setWarranty] = useState(''); // State for storing the warranty option

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
    const userId = localStorage.getItem('username');
    const accessToken = localStorage.getItem('accessToken');
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
      size, // Include size in the request
      warranty,
      files: selectedFiles
    };

    try {
      const response = await fetch('https://tuo6ab9fx3.execute-api.eu-north-1.amazonaws.com/uploadproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      if (response.ok) {
        setName('');
        setDescription('');
        setCondition('');
        setPrice('');
        setCurrency('USD');
        setCategory('');
        setSize(''); // Reset size
        setSelectedFiles([]);
        setTermsAccepted(false);
        setMessage('Product uploaded successfully!');
      } else {
        throw new Error(result.message || 'Failed to upload product due to server error');
      }
      
      setTimeout(() => {
        setIsSubmitting(false);
        setMessage('');
      }, 10000);
    } catch (error) {
      console.error('Error uploading product:', error);
      setMessage(error.message || 'Failed to upload product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    if (!["Clothing for Men", "Clothing for Women", "Sports Wear for Men", "Sports Wear for Women"].includes(e.target.value)) {
      setSize('');
    }
    if (!["Mobile Phones & Accessories", "Laptops & Tablets", "Computers & Computer Parts", "Gaming Consoles & Video Games", "TV", "Speakers", "Cameras"].includes(e.target.value)) {
      setWarranty('');
    }
    
  };

  const renderImagePreviews = () => (
    <div className="image-previews-container">
      {selectedFiles.length > 0 ? selectedFiles.map((file, index) => (
        <div key={index} className="image-preview">
          <img src={`data:image/jpeg;base64,${file.content}`} alt={`preview ${index}`} />
          <button onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))} className="remove-image">×</button>
        </div>
      )) : (
        <p className="no-images-text">No images added yet.</p>
      )}
    </div>
  );

  return (
    <div className="selling">
      <div className="header"></div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name of product</label>
          <input type="text" id="name" name="name" placeholder="Enter name of product" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={category} onChange={handleCategoryChange} required>
            <option value="">Select a category</option>
            <optgroup label="Electronics">
            <option value="Mobile Phones & Accessories">Mobile Phones & Accessories</option>
            <option value="Laptops & Tablets">Laptops & Tablets</option>
            <option value="Computers & Computer Parts">Computers & Computer Parts</option>
            <option value="Gaming Consoles & Video Games">Gaming Consoles & Video Games</option>
            <option value="TV">TV</option>
            <option value="Speakers">Speakers</option>
            <option value="Cameras">Cameras</option>
          </optgroup>

          <optgroup label="Fashion">
            <option value="Clothing for Men">Clothing for Men</option>
            <option value="Accessories for Men">Accessories for Men</option>
            <option value="Clothing for Women">Clothing for Women</option>
            <option value="Accessories for Women">Accessories for Women</option>
            <option value="Makeup and Cosmetics">Makeup and Cosmetics</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Watches">Watches</option>
            <option value="Shoes">Shoes</option>
          </optgroup>

          <optgroup label="Sports & Outdoors">
            <option value="Sports Wear for Men">Sports Wear for Men</option>
            <option value="Sports Wear for Women">Sports Wear for Women</option>
            <option value="Sports Equipment">Sports Equipment</option>
          </optgroup>

          <optgroup label="Entertainment & Hobbies">
            <option value="Musical Instruments & Gear">Musical Instruments & Gear</option>
            <option value="Books">Books</option>
            <option value="Music & Movies">Music & Movies</option>
            <option value="Stationery">Stationery</option>
          </optgroup>
          </select>
        </div>

        {/* Conditionally render the size select input if the category is one of the clothing or sports wear options */}
        {['Clothing for Men', 'Clothing for Women', 'Sports Wear for Men', 'Sports Wear for Women'].includes(category) && (
          <div className="form-group">
            <label htmlFor="size">Size</label>
            <select id="size" name="size" value={size} onChange={(e) => setSize(e.target.value)} required>
              <option value="">Select a size</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>
        )}

        {["Mobile Phones & Accessories", "Laptops & Tablets", "Computers & Computer Parts", "Gaming Consoles & Video Games", "TV", "Speakers", "Cameras"].includes(category) && (
          <div className="form-group">
            <label htmlFor="warranty">Warranty</label>
            <select id="warranty" name="warranty" value={warranty} onChange={(e) => setWarranty(e.target.value)} required>
              <option value="">Select warranty option</option>
              <option value="Warranty">Warranty</option>
              <option value="No Warranty">No Warranty</option>
            </select>
          </div>
        )}

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
            <option value="new">New with tag</option>
            <option value="Slightly Used">New without tag</option>
            <option value="Moderately Used">Good Condition</option>
            <option value="Heavily Used">Satisfactory</option>
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
        {message && (
            <p className={message.includes('successfully') ? 'message-success' : 'message-error'}>
                {message}
            </p>
        )}
      </form>
    </div>
  );
};

export default CategoriesPage;
