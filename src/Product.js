import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Product.css'; // Ensure the CSS file path is correct

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchProductDetails = async () => {
            setIsLoading(true);
            const accessToken = localStorage.getItem('accessToken');
            try {
                const response = await fetch(`https://1hdka2qnw7.execute-api.eu-north-1.amazonaws.com/default/productdetail?id=${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (!response.ok) throw new Error('Product not found.');
                   
                const data = await response.json();

                setProduct(data);  
                console.log(data)
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]); // Fetch product details whenever `id` changes

    const ProductCard = ({ product }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleDotClick = (index) => {
        setActiveIndex(index);
    };

    const handleMessageSellerClick = () => {
        const nameParam = encodeURIComponent(product[0].Name);
        const priceParam = encodeURIComponent(product[0].Price);
        const imageParam = encodeURIComponent(product[0].ImageUrls[0]);
        const userID= encodeURIComponent(product[0].UserID);
        const productID= encodeURIComponent(product[0].ProductID);
        window.location.href = `/messages?name=${nameParam}&price=${priceParam}&image=${imageParam}&sellerID=${userID}&productID=${productID}`;
    };

    if (product.length === 0 || !product[0].ImageUrls || product[0].ImageUrls.length === 0) {
        return <p>No product or images available.</p>;
    }

    if (product.length === 0 || !product[0].ImageUrls || product[0].ImageUrls.length === 0) {
        return <p>No product or images available.</p>;
    }

    return (
        <div className="full-page-container">
            <div className="upper-section">
                
            </div>
            <div className="imageecarousel">
                
                    <img src={product[0].ImageUrls[activeIndex]} alt={`Product ${product[0].Name} Image`} className="producttimage" />
                    <div className="carousel-dots">
                        {product[0].ImageUrls.map((_, index) => (
                            <span key={index} className={`dot ${index === activeIndex ? 'active' : ''}`} onClick={() => handleDotClick(index)}></span>
                        ))}
                    </div>
                
            </div>
            <div className="producttinfo">
                <h3>{product[0].Name}</h3>
                <p>Description: {product[0].Description}</p>
                <p>Condition: {product[0].Condition}</p>
                <p>Price: ${product[0].Price}</p>
                <button className="message-seller-btn" onClick={handleMessageSellerClick}>Message Seller</button>
            
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
