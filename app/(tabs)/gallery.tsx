import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useImageContext } from '@/contexts/image-context';
import { SkeletonGrid } from '@/components/SkeletonGrid';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

export default function Gallery() {
  const router = useRouter();
  const { generatedImages, isGenerating, activePrompt, setSelectedImage, expectedStylesCount } = useImageContext();

  const hasGenerated = generatedImages.length > 0;

  const ensureLocalFile = async (uri: string): Promise<string> => {
    if (uri.startsWith('data:')) {
      const base64Data = uri.includes(',') ? uri.split(',')[1] : uri;
      const localPath = FileSystem.cacheDirectory + `clipart_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(localPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return localPath;
    }
    if (uri.startsWith('http')) {
      const tempPath = FileSystem.cacheDirectory + `clipart_${Date.now()}.png`;
      const { uri: downloadedUri } = await FileSystem.downloadAsync(uri, tempPath);
      return downloadedUri;
    }
    return uri;
  };

  const handleDownload = async (img: any) => {
    try {
      const localUri = await ensureLocalFile(img.uri);
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(localUri);
        Alert.alert('Saved!', 'Image saved to your gallery.');
      } else {
        Alert.alert('Permission Denied', 'Could not save the image.');
      }
    } catch {
      Alert.alert('Download Failed', 'Could not save the image.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.iconBg}>
              <Ionicons name="brush" size={24} color="#7D48DF" />
            </View>
            <Text style={styles.headerTitle}>Flickd Clipart</Text>
          </View>

        </View>

        {/* Gallery Grid Section */}
        <View style={styles.gallerySection}>
          <View style={styles.galleryHeader}>
            <View>
              <Text style={styles.galleryTitle}>
                {isGenerating ? 'Brewing Magic...' : 'Generated Variants'}
              </Text>
              <Text style={styles.gallerySubtitle}>
                {isGenerating 
                  ? 'Weaving your concept into artistic dimensions.'
                  : hasGenerated
                    ? `${generatedImages.length} styles generated`
                    : 'No creations yet. Start by uploading an image!'}
              </Text>
            </View>
            <Pressable style={styles.regenerateBtn} onPress={() => router.push('/(tabs)')}>
              <Ionicons name="add" size={16} color="#4d525c" />
              <Text style={styles.regenerateBtnText}>New Creation</Text>
            </Pressable>
          </View>

          {isGenerating ? (
            <SkeletonGrid count={expectedStylesCount} />
          ) : hasGenerated ? (
            <View style={styles.grid}>
              {generatedImages.map((img, index) => (
                <Pressable 
                  key={index} 
                  style={styles.gridCard}
                  onPress={() => {
                    setSelectedImage(img);
                    router.push('/image-detail');
                  }}
                >
                  <View style={styles.cardImageContainer}>
                    {img.uri ? (
                      <Image source={{ uri: img.uri }} style={styles.cardImage} />
                    ) : (
                      <View style={styles.cardLoadingBg}>
                        <Ionicons name="brush" size={32} color="rgba(110,55,208,0.2)" />
                      </View>
                    )}
                    <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                      <Text style={styles.statusText}>Complete</Text>
                    </View>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{img.title}</Text>
                      <Text style={styles.cardSubtitle} numberOfLines={1}>{img.style}</Text>
                    </View>
                    <Pressable style={styles.downloadIcon} onPress={() => handleDownload(img)}>
                      <Ionicons name="download" size={20} color="#6e37d0" />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="images-outline" size={48} color="rgba(110,55,208,0.3)" />
              </View>
              <Text style={styles.emptyTitle}>Your gallery is empty</Text>
              <Text style={styles.emptySubtitle}>Upload an image and generate clipart to see your creations here.</Text>
              <Pressable onPress={() => router.push('/(tabs)')}>
                <LinearGradient colors={['#6e37d0', '#b28cff']} style={styles.emptyBtn}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.emptyBtnText}>Create Now</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </View>

        {/* Prompt Bar removed based on user feedback */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f8' },
  container: { padding: 24, paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40,
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(178,140,255,0.2)' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#6e37d0' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  historyBtn: { padding: 4 },
  gallerySection: { marginBottom: 40 },
  galleryHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 32, flexWrap: 'wrap', gap: 16,
  },
  galleryTitle: { fontSize: 28, fontWeight: 'bold', color: '#2c2f31', marginBottom: 4 },
  gallerySubtitle: { fontSize: 14, color: '#575c66' },
  regenerateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#dee2ee', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999,
  },
  regenerateBtnText: { fontWeight: 'bold', color: '#4d525c', fontSize: 14 },
  grid: { flexDirection: 'column', gap: 16 },
  gridCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 32, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
  },
  cardImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#e6e8eb',
  },
  cardImage: { width: '100%', height: '100%' },
  cardLoadingBg: {
    width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#dadde0',
  },
  statusBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, gap: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontSize: 10, fontWeight: 'bold', color: '#2c2f31', letterSpacing: 0.5, textTransform: 'uppercase',
  },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c2f31' },
  cardSubtitle: {
    fontSize: 10, fontWeight: 'bold', color: '#abadaf', letterSpacing: 1,
    textTransform: 'uppercase', marginTop: 2,
  },
  downloadIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(110,55,208,0.08)',
  },
  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(110,55,208,0.05)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#2c2f31', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#575c66', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 999, gap: 8,
  },
  emptyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
