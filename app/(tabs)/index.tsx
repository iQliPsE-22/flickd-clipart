import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useImageContext } from '@/contexts/image-context';

export default function HomeUpload() {
  const router = useRouter();
  const { sourceImageUri, setSourceImageUri, generatedImages, setSelectedImage } = useImageContext();

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select an image under 10MB.');
        return;
      }

      setSourceImageUri(asset.uri);
      router.push('/style-selection');
    }
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please take a smaller photo.');
        return;
      }

      setSourceImageUri(asset.uri);
      router.push('/style-selection');
    }
  };

  const hasRecentCreations = generatedImages.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Ionicons name="color-wand" size={24} color="#7D48DF" />
            <Text style={styles.headerTitle}>Digital Alchemist</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={20} color="#6e37d0" />
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.eyebrow}>Studio Canvas</Text>
          <Text style={styles.heroTitle}>
            Turn photos into{'\n'}
            <Text style={styles.heroTitleHighlight}>magical clipart.</Text>
          </Text>
        </View>

        {/* Upload Area */}
        <Pressable
          style={styles.uploadArea}
          onPress={pickImageFromLibrary}
        >
          {sourceImageUri ? (
            <Image source={{ uri: sourceImageUri }} style={styles.uploadPreview} />
          ) : (
            <>
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload" size={40} color="#6e37d0" />
              </View>
              <Text style={styles.uploadTitle}>Drop your image here</Text>
              <Text style={styles.uploadSubtitle}>
                Upload a clear photo of an object or character to begin the alchemy.
              </Text>
            </>
          )}
          <LinearGradient colors={['#6e37d0', '#b28cff']} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>
              {sourceImageUri ? 'Change Photo' : 'Select Photo'}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <Pressable style={styles.quickActionCard} onPress={pickImageFromCamera}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="camera" size={24} color="#6e37d0" />
            </View>
            <Text style={styles.quickActionText}>Use Camera</Text>
          </Pressable>
          {sourceImageUri ? (
            <Pressable
              style={styles.quickActionCard}
              onPress={() => router.push('/style-selection')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(110,55,208,0.15)' }]}>
                <Ionicons name="color-wand" size={24} color="#6e37d0" />
              </View>
              <Text style={styles.quickActionText}>Generate Now</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.quickActionCard} onPress={pickImageFromLibrary}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="images" size={24} color="#6e37d0" />
              </View>
              <Text style={styles.quickActionText}>Browse Gallery</Text>
            </Pressable>
          )}
        </View>

        {/* Hint */}
        <View style={styles.hintBox}>
          <Ionicons name="bulb" size={24} color="#6e37d0" />
          <Text style={styles.hintText}>
            <Text style={styles.hintTextBold}>Pro Tip: </Text>
            For best results, use high-resolution JPG or PNG images with a simple background.
          </Text>
        </View>

        {/* Recent Creations — Real generated images */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>
              {hasRecentCreations ? 'Recent Creations' : 'Get Started'}
            </Text>
            {hasRecentCreations && (
              <Pressable onPress={() => router.push('/(tabs)/gallery')}>
                <Text style={styles.recentLink}>View Library</Text>
              </Pressable>
            )}
          </View>

          {hasRecentCreations ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentList}>
              {generatedImages.slice(0, 10).map((img, i) => (
                <Pressable
                  key={i}
                  style={styles.recentCard}
                  onPress={() => {
                    setSelectedImage(img);
                    router.push('/image-detail');
                  }}
                >
                  <Image source={{ uri: img.uri }} style={styles.recentImage} />
                  <Text style={styles.recentCardTitle}>{img.title}</Text>
                  <Text style={styles.recentCardTime}>{img.style}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyCreations}>
              <View style={styles.emptyIcon}>
                <Ionicons name="images-outline" size={40} color="rgba(110,55,208,0.3)" />
              </View>
              <Text style={styles.emptyText}>
                Your creations will appear here.{'\n'}Upload a photo to get started!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f8' },
  container: { padding: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40,
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#6e37d0' },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(110,55,208,0.08)', alignItems: 'center', justifyContent: 'center',
  },
  heroSection: { marginBottom: 32 },
  eyebrow: {
    fontSize: 12, fontWeight: '700', color: '#6e37d0',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  heroTitle: { fontSize: 36, fontWeight: '800', color: '#2c2f31', lineHeight: 44 },
  heroTitleHighlight: { color: '#6226c3' },
  uploadArea: {
    backgroundColor: '#fff', borderRadius: 32, padding: 28, alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(171,173,175,0.15)', borderStyle: 'dashed', marginBottom: 20,
  },
  uploadPreview: { width: '100%', aspectRatio: 1, borderRadius: 20, marginBottom: 16 },
  uploadIconContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(178,140,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  uploadTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c2f31', marginBottom: 8 },
  uploadSubtitle: { fontSize: 15, color: '#575c66', textAlign: 'center', marginBottom: 20 },
  uploadButton: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999 },
  uploadButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  quickActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  quickActionCard: {
    flex: 1, backgroundColor: '#eff1f3', borderRadius: 24, padding: 20, alignItems: 'center', gap: 12,
  },
  quickActionIcon: {
    width: 48, height: 48, backgroundColor: '#fff', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionText: { fontWeight: 'bold', color: '#2c2f31', fontSize: 13 },
  hintBox: {
    flexDirection: 'row', backgroundColor: 'rgba(110,55,208,0.05)',
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(110,55,208,0.1)',
    marginBottom: 32, gap: 12,
  },
  hintText: { flex: 1, fontSize: 13, color: '#575c66', lineHeight: 20 },
  hintTextBold: { fontWeight: 'bold', color: '#6226c3' },
  recentSection: { marginBottom: 24 },
  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: 20,
  },
  recentTitle: { fontSize: 22, fontWeight: '800', color: '#2c2f31' },
  recentLink: { color: '#6e37d0', fontWeight: 'bold' },
  recentList: { overflow: 'visible' },
  recentCard: { width: 130, marginRight: 12 },
  recentImage: {
    width: 130, height: 130, borderRadius: 20, backgroundColor: '#e0e3e5', marginBottom: 10,
  },
  recentCardTitle: { fontWeight: 'bold', fontSize: 13, color: '#2c2f31' },
  recentCardTime: { fontSize: 11, color: '#6e37d0', fontWeight: '600' },
  // Empty state
  emptyCreations: {
    alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff',
    borderRadius: 24, borderWidth: 1, borderColor: 'rgba(171,173,175,0.1)',
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(110,55,208,0.05)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14, color: '#575c66', textAlign: 'center', lineHeight: 20,
  },
});
