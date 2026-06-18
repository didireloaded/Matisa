import { useState } from "react";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function ImageWithFallback({ src, alt, fallback, ...props }: Props) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={
        errored
          ? fallback ||
            `https://images.unsplash.com/photo-1523477800337-966dbabe060b?w=200&h=200&fit=crop`
          : src
      }
      alt={alt}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
