import React from 'react';

interface LogoProps {
  variant?: 'seahawks' | 'image' | 'roll-form' | 'monogram-g';
  size?: number;
  className?: string;
}

/**
 * High-resolution brand icon for Gutter Estimator using the Seattle Seahawks Color Palette:
 * - College Navy: #002244
 * - Action Green: #69BE28
 * - Wolf Grey:    #A5ACAF
 */
export default function GutterLogo({
  variant = 'seahawks',
  size = 42,
  className = '',
}: LogoProps) {
  if (variant === 'image') {
    return (
      <img
        src="/logos/seahawks_logo.jpg"
        alt="Gutter Estimator Logo"
        width={size}
        height={size}
        className={`rounded-xl object-cover shadow-sm ring-1 ring-[#002244]/20 ${className}`}
      />
    );
  }

  // Official Seattle Seahawks Vector Logo Component
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
        {/* College Navy Base Gradient */}
        <linearGradient id="seahawks-navy-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00162B" />
          <stop offset="0.5" stopColor="#002244" />
          <stop offset="1" stopColor="#0A2C52" />
        </linearGradient>

        {/* Wolf Grey Metallic Gradient for Extruded Profile */}
        <linearGradient id="wolf-grey-grad" x1="10" y1="12" x2="38" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F1F5F9" />
          <stop offset="0.3" stopColor="#CBD5E1" />
          <stop offset="0.7" stopColor="#A5ACAF" />
          <stop offset="1" stopColor="#64748B" />
        </linearGradient>

        {/* Action Green Glow Gradient */}
        <linearGradient id="action-green-grad" x1="14" y1="14" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8BE336" />
          <stop offset="0.6" stopColor="#69BE28" />
          <stop offset="1" stopColor="#4D9619" />
        </linearGradient>

        {/* Depth Shadow */}
        <filter id="seahawks-glow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* College Navy Squircle Shield */}
      <rect width="48" height="48" rx="12" fill="url(#seahawks-navy-grad)" filter="url(#seahawks-glow)" />
      <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="11.25" stroke="#A5ACAF" strokeWidth="1.2" strokeOpacity="0.35" />

      {/* Blueprint Grid Lines (College Navy Accent) */}
      <line x1="8" y1="24" x2="40" y2="24" stroke="#0A3663" strokeWidth="0.75" strokeDasharray="2 2" />
      <line x1="24" y1="8" x2="24" y2="40" stroke="#0A3663" strokeWidth="0.75" strokeDasharray="2 2" />
      <circle cx="24" cy="24" r="10" stroke="#0A3663" strokeWidth="0.75" strokeDasharray="2 2" />

      {/* Action Green Laser Reticle / Crosshair */}
      <circle cx="24" cy="24" r="4.5" stroke="#69BE28" strokeWidth="1" strokeOpacity="0.8" />
      <circle cx="24" cy="24" r="1.5" fill="#69BE28" />
      <line x1="16" y1="24" x2="20" y2="24" stroke="#69BE28" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="24" x2="32" y2="24" stroke="#69BE28" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="24" y1="16" x2="24" y2="20" stroke="#69BE28" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="24" y1="28" x2="24" y2="32" stroke="#69BE28" strokeWidth="1.2" strokeLinecap="round" />

      {/* Extruded Metal 'G' Monogram Gutter Contour (Wolf Grey Outer) */}
      <path
        d="M34 14H18C13.5817 14 10 17.5817 10 22V26C10 30.4183 13.5817 34 18 34H30C34.4183 34 38 30.4183 38 26V23H24"
        stroke="url(#wolf-grey-grad)"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Action Green Internal Flow Path & Precision Caliber Graduations */}
      <path
        d="M32 17H19C15.6863 17 13 19.6863 13 23V25C13 28.3137 15.6863 31 19 31H28C31.3137 31 34 28.3137 34 25V24H25"
        stroke="url(#action-green-grad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Action Green Measurement Scale Ticks */}
      <line x1="15" y1="14" x2="15" y2="11.5" stroke="#69BE28" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="14" x2="20" y2="12" stroke="#69BE28" strokeWidth="1" strokeLinecap="round" />
      <line x1="25" y1="14" x2="25" y2="11.5" stroke="#69BE28" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="30" y1="14" x2="30" y2="12" stroke="#69BE28" strokeWidth="1" strokeLinecap="round" />

      {/* Action Green Flow Direction Arrowhead */}
      <polygon points="27,24 23,21.5 23,26.5" fill="#69BE28" />
    </svg>
  );
}
