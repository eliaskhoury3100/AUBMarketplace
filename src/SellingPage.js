import React, { useState, useRef } from 'react';
import './SellingPage.css';

const CategoriesPage = () => {
  const [step, setStep] = useState(1);  // Current step of the form

  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condition: '',
    price: '',
    currency: 'USD',
    category: '',
    size: '',
    warranty: '',
    files: [],
    termsAccepted: false
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [labels, setLabels] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postButtonRef = useRef(null);

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);  // Get content part of base64
    reader.onerror = error => reject(error);
  });

  const fetchLabels = async (base64Image, filename) => {
    try {
      const response = await fetch('https://oxoeeb3trg.execute-api.eu-north-1.amazonaws.com/default/rekognition-labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          image: base64Image,
          filename: filename
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch labels');
  
      setLabels(prev => ({ ...prev, [filename]: data.labels }));
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const handleFileChange = async (event) => {
    const filesToAdd = Array.from(event.target.files);
    if (selectedFiles.length + filesToAdd.length > 6) {
      alert('You can only upload a maximum of 6 images.');
      return;
    }
    const filesWithBase64 = await Promise.all(filesToAdd.map(async file => {
      const content = await toBase64(file);
      await fetchLabels(content, file.name);
      return { name: file.name, content };
    }));
    setSelectedFiles([...selectedFiles, ...filesWithBase64].slice(0, 6));
  };

  const handlePostButtonClick = () => {
    setTimeout(() => {
      if (postButtonRef.current) {
        postButtonRef.current.focus();
        postButtonRef.current.style.backgroundColor = '#3d3d3d';
      }
    }, 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const userId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setMessage('You are not authenticated. Please login.');
      setIsSubmitting(false);
      return;
    }

    const requestBody = {
      userId,
      name: formData.name, 
      description: formData.description, 
      condition: formData.condition, 
      currency: formData.currency, 
      price: formData.price, 
      category: formData.category,
      size: formData.size,
      warranty: formData.warranty,
      files: selectedFiles
    };

    console.log(requestBody);
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
        setFormData({
          name: '',
          description: '',
          condition: '',
          price: '',
          currency: 'USD',
          category: '',
          size: '',
          warranty: '',
          files: []
        });
        setSelectedFiles([]);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({ 
      ...formData, 
      category: selectedCategory, 
      size: '',  // Reset size when category changes
      warranty: ''  // Reset warranty when category changes
    });
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

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div>
            <div className="form-group">
              <label className="bold-label">Upload Images</label>
              <button type="button" onClick={() => document.getElementById('fileUpload').click()} className="upload-trigger">+</button>
              <input type="file" id="fileUpload" style={{ display: 'none' }} multiple onChange={handleFileChange} accept="image/*" />
              {renderImagePreviews()}
            </div>
            <button onClick={nextStep} className="next-button">Next</button>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="form-group">
              <label htmlFor="name">Name of product</label>
              <input type="text" id="name" name="name" placeholder="Enter name of product" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" placeholder="Add a description" rows="4" maxLength="500" value={formData.description} onChange={handleChange} required></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <select id="condition" name="condition" value={formData.condition} onChange={handleChange} required>
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Satisfactory">Satisfactory</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (USD)</label>
              <input type="text" id="price" name="price" placeholder="Enter price" value={formData.price} onChange={handleChange} required />
            </div>
            <button onClick={prevStep} className="prev-button">Back</button>
            <button onClick={nextStep} className="next-button">Next</button>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleCategoryChange} required>
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
            <button onClick={prevStep} className="prev-button">Back</button>
            <button onClick={nextStep} className="next-button">Next</button>
          </div>
        );
      case 4:
        return (
          <div>
           {['Clothing for Men', 'Clothing for Women', 'Sports Wear for Men', 'Sports Wear for Women'].includes(formData.category) && (
  <div className="form-group">
    <label htmlFor="size">Size</label>
    <select 
      id="size" 
      name="size" 
      value={formData.size} 
      onChange={handleChange} 
      required
    >
      <option value="">Select a size</option>
      <option value="S">S</option>
      <option value="M">M</option>
      <option value="L">L</option>
      <option value="XL">XL</option>
    </select>
  </div>
)}
{["Mobile Phones & Accessories", "Laptops & Tablets", "Computers & Computer Parts", "Gaming Consoles & Video Games", "TV", "Speakers", "Cameras"].includes(formData.category) && (
  <div className="form-group">
    <label htmlFor="warranty">Warranty</label>
    <select 
      id="warranty" 
      name="warranty" 
      value={formData.warranty} 
      onChange={handleChange} 
      required
    >
      <option value="">Select warranty option</option>
      <option value="Warranty">Warranty</option>
      <option value="No Warranty">No Warranty</option>
    </select>
  </div>
)}

            
            <div className="formgroupalone">
              <label htmlFor="termsCheckbox" className="checkbox-label" style={{ fontStyle: 'italic', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  style={{ marginRight: '20px' }}
                />
                I agree to the terms and conditions.
              </label>
            </div>
            <button onClick={prevStep} className="prev-button">Back</button>
            <button 
              type="submit" 
              className="post-button" 
              disabled={!formData.termsAccepted || isSubmitting}
              ref={postButtonRef}
              onClick={handlePostButtonClick}
              style={{ backgroundColor: '#3d3d3d' }}
            >
              {isSubmitting ? 'Posting...' : 'POST'}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="selling">
      <div className="topsection">
        <nav className="uppernav">
          <img src="https://marketplacepictures.s3.eu-north-1.amazonaws.com/logo.png" alt="Logo" className="nav-logo" />
          <h1>AUB MarketPlace</h1>
        </nav>
      </div>
      
      <form onSubmit={handleSubmit}>
        {renderStep()}
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
