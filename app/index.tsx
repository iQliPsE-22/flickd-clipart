import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topSection}>
        <View style={styles.brandRow}>
          <LinearGradient
            colors={["#6e37d0", "#b28cff"]}
            style={styles.brandIcon}
          >
            <Ionicons name="color-palette" size={24} color="#fff" />
          </LinearGradient>
          <Text style={styles.brandName}>Flickd Clipart</Text>
        </View>

        <Text style={styles.title}>
          Turn any photo into{"\n"}
          <Text style={styles.titleHighlight}>clipart magic.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Create stunning illustrations, cartoons, and vector styles instantly with our powerful generative engine.
        </Text>

        <View style={styles.buttonRow}>
          <Pressable onPress={() => router.push("/(tabs)")} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            <LinearGradient
              colors={["#6e37d0", "#8e54e9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Get Started ➔</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Ionicons name="camera" size={16} color="#4b505a" />
            <Text style={styles.featureText}>Snap</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#abadaf" />
          <View style={styles.featureItem}>
            <Ionicons name="brush" size={16} color="#4b505a" />
            <Text style={styles.featureText}>Style</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#abadaf" />
          <View style={styles.featureItem}>
            <Ionicons name="download" size={16} color="#4b505a" />
            <Text style={styles.featureText}>Save</Text>
          </View>
        </View>
      </View>

      <View style={styles.imageSection}>
        <View style={styles.masonryContainer}>
          <View style={[styles.masonryCard, styles.masonryLeft]}>
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA79C7yUDAZdjzTXDqOHAUIVeq1JQljqCtyBHz1qhJZifM2oIvlyN_JTNLCKbcDYRbCD2Q3SULHqb09xKiq1g1tazizenTX9ABa_1MwE4NoqjA6mRTt_JbCFIbUNCZ97maSokIKTTSCY9twmdXpOMoOx76lkISIM3tNRIEaSDYGmeV0kjH46brw5cMGI6cuvQyhnpp2sHTc_d9oVmpBr3i6J0h7dqnRzr3leEYrnu3O_HWRp3cnurW-IhZEZ_Rv_GhakWQnBwEiVVw2",
              }}
              style={styles.masonryImage}
              contentFit="cover"
            />
          </View>
          <View style={[styles.masonryCard, styles.masonryRight]}>
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKjhLDfBLzYGdYV9Ow8xQ9RfY8hJrHk_IKvbcPhxXuawfyWjBvU1LBnNFjuGrFUq3-PYw2L47-FEQT0mYBIIR-zjTlCZpJRsspSg24bsLa-HyuW0yAWE1m1dGABL8jJSoxr4T9ESQQAOSm7h_W5rXYqHUOTc05etK5A7VxOSZ4IIbLf-sZRuoy2Bj_2CFthLHECskyHP_3ZzDs79R9R6VsgcsQcQ6CojosAgK4iyR5u5Wm3eQABqrQ8v1UuSZcTd-txm-AObFi0MBd",
              }}
              style={styles.masonryImage}
              contentFit="cover"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  topSection: {
    flex: 1,
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2D3142",
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "#2D3142",
    lineHeight: 52,
    marginBottom: 16,
    letterSpacing: -1,
  },
  titleHighlight: {
    color: "#6e37d0",
  },
  subtitle: {
    fontSize: 17,
    color: "#7E8299",
    lineHeight: 26,
    marginBottom: 36,
    fontWeight: "500",
    maxWidth: '90%',
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  primaryButton: {
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: "#6e37d0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  featuresRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4b505a",
  },
  imageSection: {
    alignItems: "center",
    paddingTop: 20,
  },
  masonryContainer: {
    width: '100%',
    height: width * 1.1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  masonryCard: {
    position: 'absolute',
    width: width * 0.58,
    aspectRatio: 3 / 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 16,
    shadowColor: '#6e37d0',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    padding: 10,
  },
  masonryImage: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#eff1f3',
  },
  masonryLeft: {
    left: width * 0.02,
    top: width * 0.2,
    transform: [{ rotate: '-8deg' }],
    zIndex: 1,
  },
  masonryRight: {
    right: width * 0.02,
    top: 0,
    transform: [{ rotate: '6deg' }],
    zIndex: 2,
  },
});
