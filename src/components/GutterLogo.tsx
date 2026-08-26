import React from 'react';

interface LogoProps {
  variant?: string;
  size?: number;
  className?: string;
}

/**
 * Official Gutter Estimator Brand Logo:
 * Machined 'G' Monogram formed by a seamless roll-formed gutter section,
 * precision caliper dial, and framing ruler in the official Seattle Seahawks Color Palette
 * (College Navy #002244, Action Green #69BE28, Wolf Grey #A5ACAF).
 */
export default function GutterLogo({
  size = 46,
  className = '',
}: LogoProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xl shadow-md border border-[#A5ACAF]/30 bg-[#00162B] ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logos/seahawks_logo.jpg"
        alt="Gutter Estimator Logo"
        width={size}
        height={size}
        className="w-full h-full object-cover select-none"
        loading="eager"
      />
    </div>
  );
}
