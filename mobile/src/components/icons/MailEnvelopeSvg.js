import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export default function MailEnvelopeSvg({ 
  size = 20, 
  color = '#2563EB', 
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Outer Envelope Rect */}
      <Rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        fill={color}
        fillOpacity="0.14"
        stroke={color}
        strokeWidth="1.8"
      />
      {/* V-Fold Flap */}
      <Path
        d="M3.5 6.5L12 12.8L20.5 6.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Medical Cross Watermark / Stamp in lower right */}
      <Path
        d="M16 14H18M17 13V15"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </Svg>
  );
}
