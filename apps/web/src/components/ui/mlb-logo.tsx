import React from 'react';

export function MlbLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width="100" height="60" rx="4" fill="#FFFFFF" />
      <path d="M0 4 C 0 1.8, 1.8 0, 4 0 L 50 0 L 50 60 L 4 60 C 1.8 60, 0 58.2, 0 56 Z" fill="#002D72" />
      <path d="M50 0 L 96 0 C 98.2 0, 100 1.8, 100 4 L 100 56 C 100 58.2, 98.2 60, 96 60 L 50 60 Z" fill="#E31937" />
      {/* Batter Silhouette - Simplified for clean look */}
      <path
        d="M52 45 C 52 45, 48 40, 48 30 C 48 20, 52 15, 52 15 L 55 12 L 58 15 C 58 15, 62 20, 62 30 C 62 40, 58 45, 58 45 Z"
        fill="white"
      />
      <path
        d="M55 45 L 55 55 M 45 30 L 65 30"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
