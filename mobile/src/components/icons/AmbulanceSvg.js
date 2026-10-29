import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export default function AmbulanceSvg({ 
  size = 22, 
  color = '#EF4444', 
  bodyColor = '#2563EB',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Ambulance Body Chassis */}
      <Path
        d="M2 7.5C2 6.67 2.67 6 3.5 6H14.5V17H2V7.5Z"
        fill={bodyColor}
        fillOpacity="0.15"
        stroke={bodyColor}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Driver Cabin Hood */}
      <Path
        d="M14.5 9H18.2C18.8 9 19.3 9.35 19.6 9.85L21.8 13.5C21.95 13.75 22 14.05 22 14.35V17H14.5V9Z"
        fill={bodyColor}
        fillOpacity="0.15"
        stroke={bodyColor}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Front Windshield Glass */}
      <Path
        d="M15.5 10.5H17.8L19.5 13.5H15.5V10.5Z"
        fill={bodyColor}
      />

      {/* Emergency Red Cross on Patient Compartment */}
      <Path
        d="M7.5 9.5H9.5V11H11V13H9.5V14.5H7.5V13H6V11H7.5V9.5Z"
        fill={color}
      />

      {/* Flashing Emergency Beacon Light */}
      <Rect x="8.5" y="3.5" width="3" height="1.8" rx="0.6" fill={color} />
      <Path d="M7 3L6 1.8M13 3L14 1.8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

      {/* Wheels */}
      <Circle cx="6.5" cy="17.5" r="2.2" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1" />
      <Circle cx="17.5" cy="17.5" r="2.2" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1" />
      <Circle cx="6.5" cy="17.5" r="0.9" fill="#94A3B8" />
      <Circle cx="17.5" cy="17.5" r="0.9" fill="#94A3B8" />
    </Svg>
  );
}
