import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useImageContext } from '@/contexts/image-context';

export default function ImageDetail() {
  const router = useRouter();
  const { selectedImage, sourceImageUri } = useImageContext();

  // If no image is selected, go back
  useEffect(() => {
    if (!selectedImage) {
      router.back();
    }
  }, [selectedImage]);

  if (!selectedImage) return null;

  const imageUri = selectedImage.uri;
  const imageTitle = selectedImage.title;
  const imageStyle = selectedImage.style;
  const imageDate = new Date(selectedImage.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  /** Convert any image URI to a local file URI */
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
    return uri; // already a local file
  };

  const handleShare = async () => {
    try {
      const localUri = await ensureLocalFile(imageUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'image/png',
          dialogTitle: `Share "${imageTitle}" Clipart`,
        });
      } else {
        await Share.share({
          message: `Check out this clipart I created: "${imageTitle}" in ${imageStyle} style!`,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const localUri = await ensureLocalFile(imageUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'image/png',
          dialogTitle: 'Save your clipart',
        });
      } else {
        Alert.alert('Not Available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Could not save the image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6e37d0" />
          </Pressable>
          <View style={styles.brandContainer}>
            <Ionicons name="color-wand" size={24} color="#7D48DF" />
            <Text style={styles.headerTitle}>Image Detail</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Before / After Comparison */}
        {sourceImageUri && (
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonLabel}>Original → Generated</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonCard}>
                <Image source={{ uri: sourceImageUri }} style={styles.comparisonImage} />
                <Text style={styles.comparisonTag}>Original</Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#b28cff" />
              <View style={styles.comparisonCard}>
                <Image source={{ uri: imageUri }} style={styles.comparisonImage} />
                <Text style={[styles.comparisonTag, { color: '#10b981' }]}>{imageStyle}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Main Image Preview */}
        <View style={styles.previewSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.mainImage} />
          </View>

          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>STYLE</Text>
              <Text style={styles.metadataValue}>{imageStyle}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>GENERATED</Text>
              <Text style={styles.metadataValue}>{imageDate}</Text>
            </View>
            <View style={[styles.metadataItem, styles.metadataItemFull]}>
              <Text style={styles.metadataLabel}>RESOLUTION</Text>
              <Text style={styles.metadataValue}>1024 x 1024</Text>
            </View>
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <Text style={styles.title}>{imageTitle}</Text>
          <Text style={styles.promptText}>
            Generated with style: <Text style={styles.promptEmphasis}>"{imageStyle}"</Text>
            {' using AI'}
          </Text>

          <View style={styles.primaryActions}>
            <Pressable style={styles.primaryButton} onPress={handleDownload}>
              <LinearGradient colors={['#6e37d0', '#b28cff']} style={styles.gradientButton}>
                <Ionicons name="download-outline" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>Save Image</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.secondaryActions}>
            <Pressable style={styles.actionCard} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color="#4d525c" />
              <Text style={styles.actionCardText}>Share</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/gallery')}>
              <Ionicons name="images-outline" size={20} color="#4d525c" />
              <Text style={styles.actionCardText}>Gallery</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.createMoreCard} onPress={() => router.push('/style-selection')}>
            <View style={styles.createMoreIcon}>
              <Ionicons name="color-wand" size={24} color="#6e37d0" />
            </View>
            <View style={styles.createMoreTextContainer}>
              <Text style={styles.createMoreTitle}>Generate More Styles</Text>
              <Text style={styles.createMoreSubtitle}>Try different styles with the same image</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#abadaf" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f8' },
  container: { padding: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#6e37d0' },
  // Comparison
  comparisonSection: { marginBottom: 24 },
  comparisonLabel: {
    fontSize: 14, fontWeight: 'bold', color: '#575c66', marginBottom: 12, textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  comparisonCard: { flex: 1, alignItems: 'center' },
  comparisonImage: {
    width: '100%', aspectRatio: 1, borderRadius: 20, marginBottom: 8, backgroundColor: '#e6e8eb',
  },
  comparisonTag: { fontSize: 11, fontWeight: 'bold', color: '#6e37d0', letterSpacing: 0.5 },
  // Preview
  previewSection: { marginBottom: 32 },
  imageContainer: {
    width: '100%', aspectRatio: 1, borderRadius: 32, overflow: 'hidden',
    backgroundColor: '#fff', marginBottom: 16,
    shadowColor: '#6e37d0', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  mainImage: { width: '100%', height: '100%' },
  metadataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metadataItem: {
    flex: 1, minWidth: '45%', backgroundColor: '#e6e8eb', padding: 16, borderRadius: 16,
  },
  metadataItemFull: { minWidth: '100%' },
  metadataLabel: {
    fontSize: 10, fontWeight: 'bold', color: '#abadaf', letterSpacing: 1, marginBottom: 4,
  },
  metadataValue: { fontSize: 16, fontWeight: 'bold', color: '#2c2f31' },
  // Actions
  actionSection: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: '#2c2f31', marginBottom: 8 },
  promptText: { fontSize: 14, color: '#575c66', lineHeight: 22, marginBottom: 28 },
  promptEmphasis: { fontStyle: 'italic', color: '#6e37d0', fontWeight: '500' },
  primaryActions: { gap: 16, marginBottom: 20 },
  primaryButton: { borderRadius: 999, overflow: 'hidden' },
  gradientButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  secondaryActions: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  actionCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#dee2ee', paddingVertical: 14, borderRadius: 16, gap: 8,
  },
  actionCardText: { color: '#4d525c', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: 'rgba(171,173,175,0.2)', marginBottom: 24 },
  createMoreCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(178,140,255,0.1)',
  },
  createMoreIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(110,55,208,0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  createMoreTextContainer: { flex: 1 },
  createMoreTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c2f31', marginBottom: 4 },
  createMoreSubtitle: { fontSize: 12, color: '#575c66' },
});
