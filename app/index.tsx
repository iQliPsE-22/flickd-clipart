import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topSection}>
        <View style={styles.brandRow}>
          <LinearGradient
            colors={['#6e37d0', '#b28cff']}
            style={styles.brandIcon}
          >
            <Text style={styles.brandIconText}>🎨</Text>
          </LinearGradient>
          <Text style={styles.brandName}>Flickd Clipart</Text>
        </View>

        <Text style={styles.title}>
          Transform your photos into <Text style={styles.titleHighlight}>clipart magic.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Create stunning illustrations, cartoons, and more with our advanced AI tools. Elevate your visual storytelling in seconds.
        </Text>

        <View style={styles.buttonRow}>
          <Pressable onPress={() => router.push('/(tabs)')}>
            <LinearGradient colors={['#6e37d0', '#b28cff']} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Get Started ➔</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureText}>Upload</Text>
          </View>
          <Text style={styles.featureArrow}>→</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎨</Text>
            <Text style={styles.featureText}>Style</Text>
          </View>
          <Text style={styles.featureArrow}>→</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💾</Text>
            <Text style={styles.featureText}>Save</Text>
          </View>
        </View>
      </View>

      <View style={styles.imageSection}>
        <View style={styles.mainImageContainer}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKjhLDfBLzYGdYV9Ow8xQ9RfY8hJrHk_IKvbcPhxXuawfyWjBvU1LBnNFjuGrFUq3-PYw2L47-FEQT0mYBIIR-zjTlCZpJRsspSg24bsLa-HyuW0yAWE1m1dGABL8jJSoxr4T9ESQQAOSm7h_W5rXYqHUOTc05etK5A7VxOSZ4IIbLf-sZRuoy2Bj_2CFthLHECskyHP_3ZzDs79R9R6VsgcsQcQ6CojosAgK4iyR5u5Wm3eQABqrQ8v1UuSZcTd-txm-AObFi0MBd' }}
            style={styles.mainImage}
            contentFit="cover"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topSection: {
    flex: 1,
    marginBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandIconText: {
    fontSize: 24,
    color: '#fff',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6e37d0',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#2c2f31',
    lineHeight: 48,
    marginBottom: 16,
  },
  titleHighlight: {
    color: '#6e37d0',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    color: '#575c66',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#6e37d0',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b505a',
  },
  featureArrow: {
    color: '#abadaf',
    fontSize: 16,
  },
  imageSection: {
    alignItems: 'center',
  },
  mainImageContainer: {
    width: '100%',
    aspectRatio: 4/5,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#6e37d0',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  mainImage: {
    flex: 1,
    width: '100%',
  },
});
