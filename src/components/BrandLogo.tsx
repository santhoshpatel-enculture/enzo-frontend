/** Enculture brand mark — public/favicon.png */
const ENCULTURE_FAVICON = '/favicon.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { box: 'w-10 h-10', img: 'w-full h-full' },
  md: { box: 'w-11 h-11', img: 'w-full h-full' },
  lg: { box: 'w-14 h-14 sm:w-16 sm:h-16', img: 'w-full h-full' },
};

export default function BrandLogo({ size = 'sm', className = '' }: BrandLogoProps) {
  const s = sizes[size];

  return (
    <div
      className={`relative ${s.box} rounded-ezo-lg flex items-center justify-center shrink-0 overflow-hidden bg-black border border-outline-variant/25 shadow-sm ${className}`}
    >
      <img
        src={ENCULTURE_FAVICON}
        alt="Enculture"
        className={`${s.img} object-cover`}
        width={40}
        height={40}
        draggable={false}
      />
    </div>
  );
}
