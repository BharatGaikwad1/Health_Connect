import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function DonateBloodHeartSvg({ 
  size = 24, 
  color = '#E11D48', 
  secondaryColor = '#FB7185',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Radiant Heart Base */}
      <Path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
        fill={color}
        fillOpacity="0.18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Central Blood Drop Silhouette */}
      <Path
        d="M12 7.5C12 7.5 9.5 10.5 9.5 12.5C9.5 13.88 10.62 15 12 15C13.38 15 14.5 13.88 14.5 12.5C14.5 10.5 12 7.5 12 7.5Z"
        fill={color}
      />
      {/* Specular Light Reflection curve */}
      <Path
        d="M10.8 11.2C10.5 11.7 10.4 12.3 10.6 12.9"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
