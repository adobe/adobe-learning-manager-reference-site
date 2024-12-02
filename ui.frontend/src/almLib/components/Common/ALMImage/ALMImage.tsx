import { useRef } from "react";

interface ALMImageProps {
  UNSAFE_className?: string;
  altText: string;
  src: string;
  defaultImageSrc?: string;
}

const ALMImage: React.FC<ALMImageProps> = ({ altText, src, UNSAFE_className, defaultImageSrc }) => {
  const imageRef = useRef<HTMLImageElement>(null);

  const onError = () => {
    if (imageRef.current && defaultImageSrc) {
      imageRef.current.src = defaultImageSrc;
    }
  };
  return (
    <img ref={imageRef} className={UNSAFE_className} alt={altText} src={src} onError={onError} />
  );
};

export default ALMImage;
