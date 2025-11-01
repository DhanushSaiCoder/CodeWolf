import React, { useState } from 'react';
import '../styles/ImageWithLoader.css';

const ImageWithLoader = ({ src, alt, className }) => {
  const [loading, setLoading] = useState(true);

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`image-container ${className}`}>
      {loading && <div className="image-loader"></div>}
      <img
        src={src}
        alt={alt}
        className={`smooth-image ${loading ? 'hidden' : 'visible'}`}
        onLoad={handleImageLoad}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ImageWithLoader;
