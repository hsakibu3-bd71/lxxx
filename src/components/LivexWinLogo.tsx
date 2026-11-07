import React from 'react';

interface LivexWinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDomain?: boolean;
}

export const LivexWinLogo: React.FC<LivexWinLogoProps> = ({
  className = '',
  size = 'md',
  showDomain = true,
}) => {
  const heightMap = {
    sm: 'h-6',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-12',
    xl: 'h-14 sm:h-16',
  };

  return (
    <div className={`inline-flex items-center gap-1 select-none ${className}`}>
      {/* Exact Vector Clone of IMG_0287.png (liveXwin) with Background Removed & Enhanced Colors */}
      <svg
        viewBox="0 0 340 92"
        className={`${heightMap[size]} w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vibrant Red Gradient matching IMG_0287 */}
          <linearGradient id="lxwRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff2a3b" />
            <stop offset="50%" stopColor="#e50914" />
            <stop offset="100%" stopColor="#9e000c" />
          </linearGradient>

          {/* Golden Orange Gradient for the crossing X wing */}
          <linearGradient id="lxwGold" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e65100" />
            <stop offset="50%" stopColor="#f57c00" />
            <stop offset="100%" stopColor="#ffb300" />
          </linearGradient>

          {/* Golden Yellow Accent Gradient */}
          <linearGradient id="lxwYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <g>
          {/* "live" text in heavy bold italic sans */}
          <text
            x="4"
            y="68"
            fontFamily="'Rajdhani', 'Inter', -apple-system, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="70"
            fill="url(#lxwRed)"
            letterSpacing="-2"
          >
            live
          </text>

          {/* Stylized "X" Crossing Swooshes from IMG_0287.png */}
          {/* Left Red Crescent Blade */}
          <path
            d="M 152 24 C 172 34 182 60 128 84 C 160 68 168 46 152 24 Z"
            fill="url(#lxwRed)"
          />

          {/* Right Gold Crescent Blade Crossing Through */}
          <path
            d="M 124 82 C 160 54 195 32 254 10 C 196 28 160 58 124 82 Z"
            fill="url(#lxwGold)"
          />

          {/* "win" text in heavy bold italic sans */}
          <text
            x="206"
            y="68"
            fontFamily="'Rajdhani', 'Inter', -apple-system, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="70"
            fill="url(#lxwRed)"
            letterSpacing="-2"
          >
            win
          </text>
        </g>
      </svg>
    </div>
  );
};
