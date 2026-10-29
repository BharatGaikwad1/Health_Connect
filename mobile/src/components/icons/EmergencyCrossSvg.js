import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export default function EmergencyCrossSvg({ 
  size = 20, 
  color = '#EF4444', 
  crossColor = '#FFFFFF',
  withBadge = false,
  ...props 
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {withBadge ? (
        <Circle cx="12" cy="12" r="11" fill={color} />
      ) : null}

      {/* Emergency First-Aid Cross */}
      <Path
        d="M9.5 4.5H14.5C15.05 4.5 15.5 4.95 15.5 5.5V8.5H18.5C19.05 8.5 19.5 8.95 19.5 9.5V14.5C19.5 15.05 19.05 15.5 18.5 15.5H15.5V18.5C15.5 19.05 15.05 19.5 14.5 19.5H9.5C8.95 19.5 8.5 19.05 8.5 18.5V15.5H5.5C4.95 15.5 4.5 15.05 4.5 14.5V9.5C4.5 8.95 4.95 8.5 5.5 8.5H8.5V5.5C8.5 4.95 8.95 4.5 9.5 4.5Z"
        fill={withBadge ? crossColor : color}
      />

      {/* Dynamic Pulse Spark on Top Right */}
      {!withBadge && (
        <Circle cx="19.5" cy="5" r="1.5" fill={color} />
      )}
    </Svg>
  );
}
