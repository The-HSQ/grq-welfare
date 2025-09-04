import { fetchImageData } from "@/lib/axios";
import { useEffect, useState } from "react";

export const useImageData = (imagePath: string | null) => {
    const [imageData, setImageData] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      if (!imagePath) return;
  
      setIsLoading(true);
      fetchImageData(imagePath)
        .then(data => URL.createObjectURL(data))
        .then(url => setImageData(url))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, [imagePath]);
  
    return { imageData, isLoading };
  };