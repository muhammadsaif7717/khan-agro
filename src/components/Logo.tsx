import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 36 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      {/* Outer elegant ring representing technology/global agriculture */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeDasharray="6 4" 
        className="text-emerald-500/30 dark:text-emerald-500/20" 
      />
      <circle cx="50" cy="50" r="40" stroke="url(#logoRingGrad)" strokeWidth="1.5" />

      {/* Modern growth chart line representing financial agriculture tracking */}
      <path
        d="M20 70 L35 55 L50 63 L80 30"
        stroke="url(#logoChartLineGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
      />
      <circle cx="80" cy="30" r="4.5" fill="#f59e0b" className="animate-pulse" />

      {/* Elegant Leafy Sprout in center-left, representing organic farming/agro nature */}
      <g transform="translate(45, 52) rotate(-15) scale(0.9)">
        {/* Main stem */}
        <path
          d="M0 20 C -2 10, 5 -5, 12 -25"
          stroke="url(#sproutStemGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Left Leaf 1 */}
        <path
          d="M3 -3 C -10 -8, -12 -18, -3 -22 C 3 -24, 7 -15, 3 -3Z"
          fill="url(#leafGrad1)"
          className="drop-shadow-[0_1px_3px_rgba(16,185,129,0.2)]"
        />
        {/* Right Leaf 2 */}
        <path
          d="M8 -14 C 18 -15, 20 -25, 12 -28 C 6 -30, 4 -20, 8 -14Z"
          fill="url(#leafGrad2)"
          className="drop-shadow-[0_1px_3px_rgba(245,158,11,0.2)]"
        />
        {/* Top Sprout Leaf */}
        <path
          d="M12 -25 C 10 -35, 16 -40, 18 -36 C 20 -32, 16 -28, 12 -25Z"
          fill="url(#leafGrad3)"
        />
      </g>

      {/* Glowing definitions */}
      <defs>
        <linearGradient id="logoRingGrad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="logoChartLineGrad" x1="20" y1="70" x2="80" y2="30">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="sproutStemGrad" x1="0" y1="20" x2="12" y2="-25">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="leafGrad1" x1="-3" y1="-22" x2="3" y2="-3">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="leafGrad2" x1="8" y1="-14" x2="12" y2="-28">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="leafGrad3" x1="12" y1="-25" x2="18" y2="-36">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}
