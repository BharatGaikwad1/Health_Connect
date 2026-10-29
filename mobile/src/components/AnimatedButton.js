import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, ActivityIndicator, View, Animated } from 'react-native';
import { RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

export const AnimatedButton = ({ 
  onPress, 
  title, 
  style, 
  textStyle, 
  theme = {}, 
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  loading = false,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Determine variant styles
  let bg = theme.primary || '#2563EB';
  let textColor = '#FFFFFF';
  let borderWidth = 0;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    bg = theme.primaryLight || '#EFF6FF';
    textColor = theme.primary || '#2563EB';
  } else if (variant === 'outline') {
    bg = 'transparent';
    textColor = theme.primary || '#2563EB';
    borderWidth = 1.5;
    borderColor = theme.primaryBorder || theme.border || '#BFDBFE';
  } else if (variant === 'ghost') {
    bg = 'transparent';
    textColor = theme.text || '#0F172A';
  } else if (variant === 'danger') {
    bg = theme.accent || '#E11D48';
    textColor = '#FFFFFF';
  }

  const paddingV = size === 'sm' ? 10 : size === 'lg' ? 18 : 14;
  const paddingH = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <TouchableWithoutFeedback 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut} 
      onPress={disabled || loading ? null : onPress}
    >
      <Animated.View 
        style={[
          styles.button, 
          { 
            backgroundColor: bg,
            paddingVertical: paddingV,
            paddingHorizontal: paddingH,
            borderWidth,
            borderColor,
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.5 : opacityAnim,
          },
          variant === 'primary' ? SHADOWS.soft : null,
          style, 
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <View style={styles.contentRow}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, { color: textColor }, textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  }
});
