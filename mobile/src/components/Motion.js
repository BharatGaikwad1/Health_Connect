import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';

export const MotiView = ({
  from,
  animate,
  transition = {},
  style,
  children,
  ...props
}) => {
  const opacityAnim = useRef(new Animated.Value(from?.opacity !== undefined ? from.opacity : 1)).current;
  const translateYAnim = useRef(new Animated.Value(from?.translateY !== undefined ? from.translateY : 0)).current;
  const translateXAnim = useRef(new Animated.Value(from?.translateX !== undefined ? from.translateX : 0)).current;
  const scaleAnim = useRef(new Animated.Value(from?.scale !== undefined ? from.scale : 1)).current;

  // Extract primitive targets to prevent unnecessary animation restarts on state updates
  const animOpacityTarget = animate?.opacity;
  const animTranslateYTarget = animate?.translateY;
  const animTranslateXTarget = animate?.translateX;
  const animScaleTarget = animate?.scale;
  const transitionDelay = transition.delay || 0;
  const transitionDuration = transition.duration;
  const isSpring = transition.type === 'spring';

  useEffect(() => {
    const animations = [];

    if (animOpacityTarget !== undefined) {
      animations.push(
        isSpring
          ? Animated.spring(opacityAnim, {
              toValue: animOpacityTarget,
              damping: transition.damping || 20,
              useNativeDriver: true,
            })
          : Animated.timing(opacityAnim, {
              toValue: animOpacityTarget,
              duration: transitionDuration || 300,
              useNativeDriver: true,
            })
      );
    }

    if (animTranslateYTarget !== undefined) {
      animations.push(
        isSpring
          ? Animated.spring(translateYAnim, {
              toValue: animTranslateYTarget,
              damping: transition.damping || 18,
              useNativeDriver: true,
            })
          : Animated.timing(translateYAnim, {
              toValue: animTranslateYTarget,
              duration: transitionDuration || 350,
              useNativeDriver: true,
            })
      );
    }

    if (animTranslateXTarget !== undefined) {
      animations.push(
        isSpring
          ? Animated.spring(translateXAnim, {
              toValue: animTranslateXTarget,
              damping: transition.damping || 18,
              useNativeDriver: true,
            })
          : Animated.timing(translateXAnim, {
              toValue: animTranslateXTarget,
              duration: transitionDuration || 350,
              useNativeDriver: true,
            })
      );
    }

    if (animScaleTarget !== undefined) {
      animations.push(
        isSpring
          ? Animated.spring(scaleAnim, {
              toValue: animScaleTarget,
              damping: transition.damping || 18,
              useNativeDriver: true,
            })
          : Animated.timing(scaleAnim, {
              toValue: animScaleTarget,
              duration: transitionDuration || 350,
              useNativeDriver: true,
            })
      );
    }

    if (animations.length > 0) {
      if (transitionDelay > 0) {
        const timer = setTimeout(() => {
          Animated.parallel(animations).start();
        }, transitionDelay);
        return () => clearTimeout(timer);
      } else {
        Animated.parallel(animations).start();
      }
    }
  }, [animOpacityTarget, animTranslateYTarget, animTranslateXTarget, animScaleTarget, transitionDelay, transitionDuration, isSpring]);

  const animatedStyle = {
    opacity: opacityAnim,
    transform: [
      { translateY: translateYAnim },
      { translateX: translateXAnim },
      { scale: scaleAnim },
    ],
  };

  return (
    <Animated.View style={[style, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
};

export const MotiText = ({
  from,
  animate,
  transition = {},
  style,
  children,
  ...props
}) => {
  const opacityAnim = useRef(new Animated.Value(from?.opacity !== undefined ? from.opacity : 1)).current;
  const translateYAnim = useRef(new Animated.Value(from?.translateY !== undefined ? from.translateY : 0)).current;

  const animOpacityTarget = animate?.opacity;
  const animTranslateYTarget = animate?.translateY;
  const transitionDelay = transition.delay || 0;
  const transitionDuration = transition.duration;
  const isSpring = transition.type === 'spring';

  useEffect(() => {
    const animations = [];

    if (animOpacityTarget !== undefined) {
      animations.push(
        isSpring
          ? Animated.spring(opacityAnim, {
              toValue: animOpacityTarget,
              damping: transition.damping || 20,
              useNativeDriver: true,
            })
          : Animated.timing(opacityAnim, {
              toValue: animOpacityTarget,
              duration: transitionDuration || 300,
              useNativeDriver: true,
            })
      );
    }

    if (animTranslateYTarget !== undefined) {
      animations.push(
        isSpring
          ? Animated.spring(translateYAnim, {
              toValue: animTranslateYTarget,
              damping: transition.damping || 18,
              useNativeDriver: true,
            })
          : Animated.timing(translateYAnim, {
              toValue: animTranslateYTarget,
              duration: transitionDuration || 350,
              useNativeDriver: true,
            })
      );
    }

    if (animations.length > 0) {
      if (transitionDelay > 0) {
        const timer = setTimeout(() => {
          Animated.parallel(animations).start();
        }, transitionDelay);
        return () => clearTimeout(timer);
      } else {
        Animated.parallel(animations).start();
      }
    }
  }, [animOpacityTarget, animTranslateYTarget, transitionDelay, transitionDuration, isSpring]);

  return (
    <Animated.Text
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
      {...props}
    >
      {children}
    </Animated.Text>
  );
};
