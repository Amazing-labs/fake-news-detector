import React from "react";

interface ShieldLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const ShieldLogo: React.FC<ShieldLogoProps> = ({
  width = 340,
  height = 380,
  className,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 340 380"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Icone bouclier fake news detector</title>
      <desc>
        Un bouclier vert avec une loupe et une coche, sur fond transparent.
      </desc>
      <path
        d="M170 20 L260 55 L260 170 C260 230 220 270 170 300 C120 270 80 230 80 170 L80 55 Z"
        fill="#1D9E75"
      />
      <path
        d="M170 20 L260 55 L260 170 C260 230 220 270 170 300 Z"
        fill="#5DCAA5"
      />
      <circle
        cx="148"
        cy="150"
        r="30"
        fill="none"
        stroke="#0D0D0D"
        strokeWidth="8"
      />
      <line
        x1="170"
        y1="172"
        x2="200"
        y2="202"
        stroke="#0D0D0D"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M136 154 L146 166 L165 138"
        fill="none"
        stroke="#0D0D0D"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ShieldLogo;
