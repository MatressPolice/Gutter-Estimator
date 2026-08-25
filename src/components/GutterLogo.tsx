import React from 'react';

interface LogoProps {
  variant?: 'roll-form' | 'monogram-g' | 'blueprint' | 'crest';
  size?: number;
  className?: string;
}

/**
 * High-resolution vector brand icons designed specifically for Gutter Estimator.
 */
export default function GutterLogo({
  variant = 'roll-form',
  size = 40,
  className = '',
}: LogoProps) {
  if (variant === 'monogram-g') {
    // Concept 2: Geometric Monogram "G" formed by an extruded gutter cross-section
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <defs>
          <linearGradient id="g-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="metal-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>
          <filter id="shadow-g" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
          </filter>
        </defs>
        {/* Background Shield */}
        <rect width="48" height="48" rx="12" fill="url(#metal-grad)" />
        <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#334155" strokeWidth="1" />
        
        {/* Extruded Gutter G Symbol */}
        <path
          d="M36 14H16C12.6863 14 10 16.6863 10 20V28C10 31.3137 12.6863 34 16 34H32C35.3137 34 38 31.3137 38 28V24H24"
          stroke="url(#g-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow-g)"
        />
        {/* Measurement Tick Marks */}
        <line x1="16" y1="18" x2="16" y2="21" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="18" x2="22" y2="20" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="28" y1="18" x2="28" y2="21" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="18" x2="34" y2="20" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
        {/* Laser alignment dot */}
        <circle cx="24" cy="24" r="2" fill="#00FFFF" />
      </svg>
    );
  }

  if (variant === 'blueprint') {
    // Concept 3: Blueprint architectural cross-section with dimension lines
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <defs>
          <linearGradient id="bp-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="bp-accent" x1="10" y1="12" x2="38" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#bp-bg)" />
        <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#1E3A8A" strokeWidth="1" />
        
        {/* Blueprint Grid Lines */}
        <line x1="8" y1="24" x2="40" y2="24" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="24" y1="8" x2="24" y2="40" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />

        {/* K-Style Gutter Contour */}
        <path
          d="M10 16H14L18 22L18 32H34L38 16"
          stroke="url(#bp-accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dimension ticks */}
        <line x1="10" y1="36" x2="38" y2="36" stroke="#00FFFF" strokeWidth="1.5" strokeDasharray="1 1" />
        <path d="M10 34V38M38 34V38" stroke="#00FFFF" strokeWidth="1.5" />
      </svg>
    );
  }

  // Concept 1 (Default): "The Precision Roll-Form"
  // Dynamic extruded K-style gutter shell with precision calculation ticks
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="main-blue-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="cyan-glow" x1="10" y1="12" x2="38" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="0.6" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#A5F3FC" />
        </linearGradient>
        <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer Squircle Container */}
      <rect width="48" height="48" rx="12" fill="url(#main-blue-grad)" filter="url(#soft-shadow)" />
      <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="11.25" stroke="#60A5FA" strokeOpacity="0.4" strokeWidth="1.5" />

      {/* Front Face: Precision K-Style Gutter Cross-Section */}
      <path
        d="M11 15H16L20 22V31C20 32.1046 20.8954 33 22 33H33C34.1046 33 35 32.1046 35 31V15H38"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Extruded Flow Inner Accent */}
      <path
        d="M17 19L20 24V29H31V19"
        stroke="url(#cyan-glow)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />

      {/* Micro Laser Caliber Measurement Ticks */}
      <line x1="24" y1="29" x2="24" y2="26" stroke="#00FFFF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27.5" y1="29" x2="27.5" y2="27" stroke="#00FFFF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
