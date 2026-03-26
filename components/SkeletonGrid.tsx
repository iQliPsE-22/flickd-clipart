import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, item) => (
        <View key={item} style={styles.gridCard}>
          <Animated.View style={[styles.cardImageContainer, { opacity }]} />
          <View style={styles.cardInfo}>
            <View style={styles.textSkeletonContainer}>
              <Animated.View style={[styles.titleSkeleton, { opacity }]} />
              <Animated.View style={[styles.subtitleSkeleton, { opacity }]} />
            </View>
            <Animated.View style={[styles.iconSkeleton, { opacity }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'column',
    gap: 16,
  },
  gridCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: '#dadde0',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSkeletonContainer: {
    flex: 1,
    gap: 6,
    paddingRight: 12,
  },
  titleSkeleton: {
    height: 16,
    width: '80%',
    backgroundColor: '#dadde0',
    borderRadius: 8,
  },
  subtitleSkeleton: {
    height: 10,
    width: '50%',
    backgroundColor: '#dadde0',
    borderRadius: 5,
  },
  iconSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dadde0',
  },
});
