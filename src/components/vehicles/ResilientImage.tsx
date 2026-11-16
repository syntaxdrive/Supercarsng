import { useState } from 'react';
import { CarFront } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ResilientImage({
  src,
  alt,
  className = 'h-full w-full object-cover',
  fallbackLabel,
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#17191C] via-[#101113] to-[#0A0A0B] p-6 text-center"
        role="img"
        aria-label={alt}
      >
        <CarFront className="mb-3 h-8 w-8 text-[#B9BDC3]/50" strokeWidth={1.25} />
        <span className="text-xs font-medium tracking-wide text-[#B9BDC3]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
