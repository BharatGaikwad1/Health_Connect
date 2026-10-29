import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export default function DocumentCertificateSvg({ 
  size = 20, 
  color = '#2563EB', 
  sealColor = '#E11D48',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Certificate Sheet with Folded Corner */}
      <Path
        d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Folded Top-Right Corner */}
      <Path
        d="M14 2V8H20"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Certificate Text Lines */}
      <Path
        d="M8 12H13M8 9H11M8 15H11"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Official State Accreditation Wax Seal */}
      <Circle cx="15.5" cy="16.5" r="2.5" fill={sealColor} />
      <Path
        d="M14.5 19L14 21.5L15.5 20.5L17 21.5L16.5 19"
        fill={sealColor}
      />
    </Svg>
  );
}
