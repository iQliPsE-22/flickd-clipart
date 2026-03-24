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
            <Text style={styles.brandIconText}>✨</Text>
          </LinearGradient>
          <Text style={styles.brandName}>Digital Alchemist</Text>
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
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Login</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.avatarGroup}>
            {[
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBxsSspyTNYBroSonvlF4Jdg0AifaHsb9tCnWoOZ2s2zmxo5Ti2TgbpG2LQcxZFTDXC46H-6g2oP_Vv1IkTrGnGwxKTR5jXTLdaXxvj8Dvxr6-Y5MZXbcUhE2u1LtFStSBpHGrGiHVmhQ4mZHeH3Z_7nS1-3q_Y9eie2FAeN6rqWhgtjOaIPN9WjZHLjkDTx5vHYFa5wcCb8JFy5gGBo-nogM3WpmFw7BfuB4-wRZqif228_Ry2Lzw2aHQvKSqdXIUqn7QLbva7Z0Tt',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuC3A19oMgfd_Fs2dgeTo6E-R_6450eAXsAB_8hJvhaFNPd57im4WoQ-f5DYFIkGXB8uVZrReFB0svuLdRCE6hdByWD_CwYAGVnUmehlzQzwEfYmvDyeyB3VtLMU4WctFY53Oo80LwCysbsE0fq4wRWGIZ-5g7RJ2nmnnjuxgEnopmU56matrKGe3uVApEhelP5glE5NNbm6BMuzalOnPvPg3gbwOyUut9MLaWmVYQpQChoKOLfS4PJB_BgayfbIiZ13yYk0kOA72iO1',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDf9NjRuaUvToo5ctF9NhKMvI23QtqSebLT1RwvDTmnWSiD4pSxMw6iGP79upXnvxC3jiZ9Z4n7j5fq6h0CE8P-b85fOke0TkPjje7qqRZL93jVRnf3ZjOx7yWm6LuzXEjqSbbR4Iiq9FVsERhOVAM3kvUfbvmZGUH6I7XUmXf5gp1bzhmZRerL7TCWrtzN5FXJIm4OoRri9cv5VLiFWnwgJ06IM2HZsK6QcPLY_7NMgmepbqgtYYuDSUrbobTgv1-lvKlxT5AW29KI',
            ].map((uri, index) => (
              <Image key={index} source={{ uri }} style={[styles.avatar, { marginLeft: index > 0 ? -12 : 0 }]} />
            ))}
          </View>
          <Text style={styles.statsText}>Joined by <Text style={styles.statsBoldText}>12k+</Text> creators worldwide</Text>
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
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: '#dee2ee',
  },
  secondaryButtonText: {
    color: '#4d525c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGroup: {
    flexDirection: 'row',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statsText: {
    fontSize: 12,
    color: '#4b505a',
  },
  statsBoldText: {
    fontWeight: 'bold',
    color: '#2c2f31',
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
