import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, fallback }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageError(true);
      return;
    }

    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = src;
  }, [src]);

  if (imageError) {
    return <>{fallback}</>;
  }

  if (!imageLoaded) {
    return (
      <Skeleton className={className} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

export default LazyImage;
