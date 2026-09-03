import React from 'react';
import logoImg from '../assets/logo_light_arctic.jpg';

interface LogoProps {
  variant?: string;
  size?: number;
  className?: string;
}

/**
 * Official Gutter Estimator Brand Logo:
 * Machined 'G' Monogram formed by a seamless roll-formed gutter section,
 * precision caliper dial, and framing ruler in the official Seattle Seahawks Light Color Palette
 * (Arctic White, Wolf Grey #A5ACAF, Action Green #69BE28, College Navy #002244).
 */
export default function GutterLogo({
  size = 46,
  className = '',
}: LogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xl shadow-xs border border-slate-200/80 bg-white ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoImg}
        alt="Gutter Estimator Logo"
        width={size}
        height={size}
        className="w-full h-full object-cover select-none"
        loading="eager"
      />
    </div>
  );
}
