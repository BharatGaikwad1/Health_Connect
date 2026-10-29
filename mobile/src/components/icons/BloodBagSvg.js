import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export default function BloodBagSvg({ 
  size = 24, 
  color = '#E11D48', 
  liquidColor = '#EF4444',
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Hanging Loop Eyelet */}
      <Path
        d="M10 2H14C14.55 2 15 2.45 15 3V4H9V3C9 2.45 9.45 2 10 2Z"
        fill={color}
      />
      <Circle cx="12" cy="3" r="0.8" fill="#FFFFFF" />

      {/* Main Bag Contour */}
      <Rect
        x="6"
        y="4"
        width="12"
        height="15"
        rx="3.5"
        fill={liquidColor}
        fillOpacity="0.16"
        stroke={color}
        strokeWidth="1.6"
      />

      {/* Blood Fluid Fill Volume */}
      <Path
        d="M7 11.5C8.5 11 10 12.5 12 11.5C14 10.5 15.5 12 17 11.5V15.5C17 17.43 15.43 19 13.5 19H10.5C8.57 19 7 17.43 7 15.5V11.5Z"
        fill={liquidColor}
      />

      {/* Graduation Volume Marks */}
      <Path
        d="M8.5 7H10.5M8.5 9H11M8.5 11H10.5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Central Medical Cross on Bag */}
      <Path
        d="M13.5 13.5H16.5M15 12V15"
        stroke="#FFFFFF"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Infusion Delivery Tube & Flow Clamp */}
      <Path
        d="M12 19V22M12 22H14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
