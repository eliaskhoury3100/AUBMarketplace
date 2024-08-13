import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Product.css'; // Ensure the CSS file path is correct


const ProductDetail = () => {
    const { id, pk } = useParams();
    const [product, setProduct] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [profilePicture, setProfilePicture] = useState(null);
    const [username, setusername]= useState('');
    const decodedId = decodeURIComponent(id);
    const [sub, setSub] = useState(''); // State variable to store sub
    const decodedPk = decodeURIComponent(pk);
    const encodedId = encodeURIComponent(id);  // This will convert '#' to '%23'
    const encodedPk = encodeURIComponent(pk);
    const userId = localStorage.getItem('userId'); // Get userId from local storage
    const sizeCategories = ['Clothing for Men', 'Clothing for Women', 'Sports Wear for Men', 'Sports Wear for Women'];
    const warrantyCategories = ["Mobile Phones & Accessories", "Laptops & Tablets", "Computers & Computer Parts", "Gaming Consoles & Video Games", "TV", "Speakers", "Cameras"];
    useEffect(() => {
        const fetchProductDetails = async () => {
            setIsLoading(true);
            const accessToken = localStorage.getItem('accessToken');
            try {
                const response = await fetch(`https://1hdka2qnw7.execute-api.eu-north-1.amazonaws.com/default/productdetail?id=${encodedId}&pk=${encodedPk}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (!response.ok) throw new Error('Product not found.');
                   
                const data = await response.json();
                console.log(data)
                setProduct(data);  
                const user= data[0].UserID;
                console.log(data)
                const userApiUrl = `https://aymj5wwai6.execute-api.eu-north-1.amazonaws.com/retreiveUserInfo?userId=${user}`;
                const userResponse = await fetch(userApiUrl, {
                    method: 'GET',
                    headers: {
                         'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (!userResponse.ok) throw new Error('User not found.');

                const userData = await userResponse.json();
                console.log("UserData:", userData)
                setProfilePicture(userData['custom:ProfilePicture'] || ''); // Assuming the API returns a profilePictureUrl
                setusername(userData['email'])
                setSub(userData['sub']); // Store the sub in the state
                console.log(profilePicture)
                console.log(username)
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
           
        };

        fetchProductDetails();
    }, [id, pk]); // Fetch product details whenever `id` changes

    const extractUsername = (email) => {
        return email ? email.split('@')[0] : '';
    };

    const ProductCard = ({ product }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleDotClick = (index) => {
        setActiveIndex(index);
    };

    const handleProfileRedirect = () => {
        // Redirect to the user profile page with the sub attribute
        window.location.href = `/userprofile/${sub}`;
    };

    const handleMessageSellerClick = () => {
        const nameParam = encodeURIComponent(product[0].Title);
        const priceParam = encodeURIComponent(product[0].Price);
        const imageParam = encodeURIComponent(product[0].ImageUrl[0]);
        const userID= encodeURIComponent(extractUsername(username));
        const productID= encodeURIComponent(product[0].SK);
        window.location.href = `/messages?name=${nameParam}&price=${priceParam}&image=${imageParam}&sellerID=${userID}&productID=${productID}`;
    };

    const handleDeleteItemClick = async () => {
        const accessToken = localStorage.getItem('accessToken'); // Ensure the accessToken is retrieved securely
        const productId = product[0].SK; // Assuming 'SK' is your product identifier
        console.log(productId)
        try {
            const response = await fetch(`https://ktjr1s65ll.execute-api.eu-north-1.amazonaws.com/default/deleteitem?id=${encodeURIComponent(productId)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete the product.');
            }
    
            // Successfully deleted the product
            window.location.href= ('/userprofile')
            // Optionally, redirect the user or refresh the product list
        } catch (err) {
            console.error('Error:', err.message);
        }
    };
    

    if (product.length === 0 || !product[0].ImageUrl || product[0].ImageUrl.length === 0) {
        return <p>No product or images available.</p>;
    }

    if (product.length === 0 || !product[0].ImageUrl || product[0].ImageUrl.length === 0) {
        return <p>No product or images available.</p>;
    }

    return (
        <div className="full-page-container">
            <div className="upper-section" onClick={handleProfileRedirect}>
            {profilePicture && <img src={profilePicture} alt="Profile Picture" className="profile-picture" />}
                    {username && <p className="username">{extractUsername(username)}</p>}
            </div>
            <div className="imageecarousel">
                
                    <img src={product[0].ImageUrl[activeIndex]} alt={`Product ${product[0].Title} Image`} className="producttimage" />
                    <div className="carousel-dots">
                        {product[0].ImageUrl.map((_, index) => (
                            <span key={index} className={`dot ${index === activeIndex ? 'active' : ''}`} onClick={() => handleDotClick(index)}></span>
                        ))}
                    </div>
                
            </div>
            <div className="producttinfo">
                <h3>{product[0].Title}</h3>
                <p>Description: {product[0].Description}</p>
                {sizeCategories.includes(product[0].PK) && (
                <p>Size: {product[0].Size}</p>
                )}
                {warrantyCategories.includes(product[0].PK) && (
                <p>{product[0].Warranty}</p> // Assuming 'Warranty' is a field in your product
                )}
                <p>Condition: {product[0].Condition}</p>
                <p>Price: ${product[0].Price}</p>
            </div>
            <div className="buttons-section">
                <div className="buttons-container">
                    {userId != sub && (
                    <button className="message-seller-button" onClick={handleMessageSellerClick}>Message Seller</button>
                    )}
                    {userId === sub && (
                        <button className="delete-item-button" onClick={handleDeleteItemClick}>Delete Item</button>
                    )}
                </div>
            </div>
        </div>
    );
};


    if (isLoading) return <div className="full-page-container">Loading...</div>;
    if (error) return <div className="full-page-container">Error: {error}</div>;
    if (!product || Object.keys(product).length === 0) {
        return <div className="full-page-container">No product details available.</div>;
    }

    // Render ProductCard component inside ProductDetail component
    return (
        <div className="full-page-container">
            <ProductCard product={product} />
        </div>
    );
};

export default ProductDetail;
