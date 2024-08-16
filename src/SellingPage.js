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
  const [suggestedCategories, setSuggestedCategories] = useState([]);

  
  const postButtonRef = useRef(null);

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);  // Get content part of base64
    reader.onerror = error => reject(error);
  });

  const renderSuggestedCategories = () => {
    if (suggestedCategories.length > 0) {
      return (
        <div className="suggested-categories" style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Categories suggested based on the pictures you uploaded:</h3>
          <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
            {suggestedCategories.map((category, index) => (
              <li key={index} style={{ fontStyle: 'italic', padding: '5px 0' }}>
                <span style={{ color: '#333', fontSize: '16px' }}>{category}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };
  
  const ProgressBar = ({ step, totalSteps }) => {
    const progressPercentage = (step / totalSteps) * 100;
  
    return (
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    );
  };

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
      console.log(data)
      const categories = data || []; // Use data directly if it's already the array
      console.log("Fetched categories:", categories); // Log the fetched categories
      setSuggestedCategories(categories);
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

    // Convert all files to Base64 and update UI immediately
    const filesWithBase64 = await Promise.all(filesToAdd.map(async (file) => {
      const content = await toBase64(file);
      return { name: file.name, content };
    }));

    // Update selectedFiles immediately to show previews
    setSelectedFiles(prevFiles => [...prevFiles, ...filesWithBase64].slice(0, 6));

    // Fetch labels only for the first file asynchronously, without awaiting the result here
    if (selectedFiles.length === 0 && filesWithBase64.length > 0) {
      const firstFile = filesWithBase64[0];
      fetchLabels(firstFile.content, firstFile.name)
        .catch(error => {
          console.error('Error fetching labels:', error);
        });
    }
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
        setSuggestedCategories([]);  // Reset suggested categories here
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
          <button 
            onClick={() => {
              const updatedFiles = selectedFiles.filter((_, i) => i !== index);
              setSelectedFiles(updatedFiles);
              // Reset suggested categories if the first image is deleted
              if (index === 0) {
                setSuggestedCategories([]);
              }
            }} 
            className="remove-image">×</button>
        </div>
      )) : (
        <p className="no-images-text">No images added yet. Add up to 6 images!</p>
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
    const totalSteps = 4;

    return (
     <div>
  {step === 1 && (
   <div className="form-group">
   <div className="upload-container">
       <label className="boldlabelspecial">Upload Images</label>
       <div className="vertical-line"></div> 
       <button type="button" onClick={() => document.getElementById('fileUpload').click()} className="upload-trigger">+</button>
       <input type="file" id="fileUpload" style={{ display: 'none' }} multiple onChange={handleFileChange} accept="image/*" />
   </div>
   <div className="image-preview-container">
        {renderImagePreviews()}
    </div>

            <div className="navigation-container">
    
    <button onClick={nextStep} className="next-button">
        <i className="fas fa-arrow-right"></i>
    </button>
</div>
          </div>
        )}
        {step === 2 && (
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
            <div className="navigation-container">
    <button onClick={prevStep} className="prev-button">
        <i className="fas fa-arrow-left"></i>
    </button>
    <button onClick={nextStep} className="next-button">
        <i className="fas fa-arrow-right"></i>
    </button>
</div>


          </div>
        )}
  {step === 3 && (
  <div>
     <div style={{ marginTop: '40px' }}> {/* Add margin here */}
      {renderSuggestedCategories()} {/* Display suggested categories here */}
    </div>


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

    {/* Size field for Fashion categories */}
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

    {/* Warranty field for Electronics categories */}
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

    <div className="navigation-container">
      <button onClick={prevStep} className="prev-button">
        <i className="fas fa-arrow-left"></i>
      </button>
      <button onClick={nextStep} className="next-button">
        <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  </div>
)}


{step === 4 && (
  <div  className="container">
    {/* Styled Box for Terms and Conditions */}
    <div className="terms-and-conditions-box" style={{ 
        padding: '20px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px', 
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', 
        marginBottom: '20px' 
    }}>
      <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Terms and Conditions for Uploading a Product</p>
      <p style={{ fontSize: '14px', marginBottom: '10px' }}>By uploading a product, you agree to the following:</p>
      <ul style={{ paddingLeft: '20px', listStyleType: 'disc', fontSize: '14px', color: '#333' }}>
        <li><strong>Accuracy:</strong> Ensure all product details are correct and not misleading.</li>
        <li><strong>Ownership:</strong> You confirm you own the rights to the product and that it does not violate any third-party rights.</li>
        <li><strong>Prohibited Items:</strong> Do not upload illegal, counterfeit, or prohibited items.</li>
        <li><strong>Compliance:</strong> Your product must comply with all applicable laws.</li>
        <li><strong>Liability:</strong> AUB MarketPlace is not responsible for disputes arising from your listings.</li>
        <li><strong>Removal:</strong> We may remove listings that violate these terms.</li>
      </ul>
      <p style={{ fontSize: '14px' }}>By proceeding, you agree to these terms.</p>
    </div>

    {/* Checkbox to agree to terms */}
    <div className="formgroupalone">
      <label htmlFor="termsCheckbox" className="checkbox-label" style={{ fontStyle: 'italic', fontSize: '14px' }}>
        <input
          type="checkbox"
          id="termsCheckbox"
          checked={formData.termsAccepted}
          onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
          style={{ marginRight: '10px' }}
        />
        I agree to the terms and conditions.
      </label>
    </div>
    
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
    <div className="navigation-container">
      <button onClick={prevStep} className="prev-button">
        <i className="fas fa-arrow-left"></i>
      </button>
    </div>
  </div>
)}





<ProgressBar step={step} totalSteps={totalSteps} />

      </div>
    );
  };

  return (
    <div className="selling">
      <div className="topsection">
        <nav className="uppernav">
         
          <h1>Upload Product</h1>
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
