import { useState } from 'react';
import { Car } from 'lucide-react';

interface CarImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export function CarImage({ src, alt, title, className = '' }: CarImageProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = src.startsWith('/src/assets/')
    ? `${import.meta.env.BASE_URL}${src.slice(1)}`
    : src;

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#23252A] via-[#18191D] to-[#0D0E11] text-[#E5E4E0] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Car className="w-10 h-10 text-[#9CA3AF] mb-2" strokeWidth={1.5} />
        <span className="text-sm font-medium tracking-tight">{title || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
