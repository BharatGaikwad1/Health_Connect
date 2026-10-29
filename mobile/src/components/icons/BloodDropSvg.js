import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function BloodDropSvg({ 
  size = 20, 
  color = '#DC2626', 
  secondaryColor = '#F87171',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Defs>
        <LinearGradient id="bloodGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={secondaryColor} />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>
      </Defs>

      {/* Fluid Hydrodynamic Blood Drop Shape */}
      <Path
        d="M12 2.5C12 2.5 5.5 10.5 5.5 15.5C5.5 19.0899 8.41015 22 12 22C15.5899 22 18.5 19.0899 18.5 15.5C18.5 10.5 12 2.5 12 2.5Z"
        fill="url(#bloodGrad)"
      />

      {/* Glistening Light Specular Reflection */}
      <Path
        d="M8.5 14C8.5 12.2 9.5 10.5 10.5 9.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* Mini Medical Plus in Center */}
      <Path
        d="M12 13V17M10 15H14"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}
