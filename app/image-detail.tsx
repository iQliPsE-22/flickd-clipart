import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useImageContext } from '@/contexts/image-context';

export default function ImageDetail() {
  const router = useRouter();
  const { selectedImage, sourceImageUri } = useImageContext();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [containerWidth, setContainerWidth] = useState(0);
  const [sliderPos, setSliderPos] = useState(0.5); // 50%

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

  const handleShare = async () => {
    if (isSharing || isDownloading) return;
    setIsSharing(true);
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
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (isSharing || isDownloading) return;
    setIsDownloading(true);
    try {
      const localUri = await ensureLocalFile(imageUri);
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(localUri);
        Alert.alert('Saved!', 'Image saved to your gallery.');
      } else {
        Alert.alert('Permission Denied', 'Could not save the image. Please grant gallery access.');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Could not save the image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportSVG = async () => {
    if (isSharing || isDownloading) return;
    setIsDownloading(true);
    try {
      let base64Data = '';
      if (imageUri.startsWith('data:')) {
        base64Data = imageUri.includes(',') ? imageUri : `data:image/png;base64,${imageUri}`;
      } else {
        const localUri = await ensureLocalFile(imageUri);
        const b64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
        base64Data = `data:image/png;base64,${b64}`;
      }

      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><image href="${base64Data}" width="1024" height="1024" /></svg>`;

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            `flickd_clipart_${Date.now()}.svg`,
            'image/svg+xml'
          );
          await FileSystem.writeAsStringAsync(uri, svgContent, { encoding: FileSystem.EncodingType.UTF8 });
          Alert.alert('Saved!', 'SVG vector file saved to your device.');
        } else {
          Alert.alert('Permission Denied', 'Cannot save without directory access.');
        }
      } else {
        const localSvgPath = FileSystem.cacheDirectory + `clipart_${Date.now()}.svg`;
        await FileSystem.writeAsStringAsync(localSvgPath, svgContent, { encoding: FileSystem.EncodingType.UTF8 });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localSvgPath, { mimeType: 'image/svg+xml', UTI: 'public.svg-image' });
        } else {
          Alert.alert('SVG Export generated', `Saved to ${localSvgPath}`);
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Export SVG Failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTouch = (evt: any) => {
    const localX = evt.nativeEvent.locationX;
    if (containerWidth > 0 && localX >= 0 && localX <= containerWidth) {
      setSliderPos(localX / containerWidth);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6e37d0" />
          </Pressable>
          <View style={styles.brandContainer}>
            <Ionicons name="brush" size={24} color="#7D48DF" />
            <Text style={styles.headerTitle}>Image Detail</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.previewSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#abadaf', letterSpacing: 1 }}>BEFORE</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#7D48DF', letterSpacing: 1 }}>AFTER</Text>
          </View>
          
          <View 
            style={styles.imageContainer}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onResponderMove={handleTouch}
            onResponderGrant={handleTouch}
          >
            {!imageError ? (
              <>
                {sourceImageUri && (
                  <Image source={{ uri: sourceImageUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" pointerEvents="none" />
                )}

                <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: `${(1 - sliderPos) * 100}%`, overflow: 'hidden' }} pointerEvents="none">
                  <Image source={{ uri: imageUri }} style={{ width: containerWidth, height: containerWidth, position: 'absolute', right: 0 }} contentFit="cover" onLoad={() => setImageError(false)} onError={() => setImageError(true)} />
                </View>

                <View style={[styles.sliderLine, { right: `${(1 - sliderPos) * 100}%` }]} pointerEvents="none">
                  <View style={styles.sliderHandle}>
                    <Ionicons name="swap-horizontal" size={16} color="#6e37d0" />
                  </View>
                </View>
              </>
            ) : (
              <View style={[styles.mainImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2' }]}>
                <Ionicons name="image-outline" size={48} color="#ef4444" style={{opacity: 0.5}} />
                <Text style={{ marginTop: 12, color: '#ef4444', fontWeight: 'bold' }}>Image unavailable or expired</Text>
              </View>
            )}
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
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.title}>{imageTitle}</Text>
          <Text style={styles.promptText}>
            Generated with style: <Text style={styles.promptEmphasis}>"{imageStyle}"</Text>{' using AI'}
          </Text>

          <View style={{ gap: 12, marginBottom: 20 }}>
            <Pressable style={styles.primaryButton} onPress={handleDownload} disabled={isDownloading}>
              <LinearGradient colors={['#6e37d0', '#b28cff']} style={styles.gradientButton}>
                {isDownloading ? <ActivityIndicator color="#fff" /> : <Ionicons name="download-outline" size={24} color="#fff" />}
                <Text style={styles.primaryButtonText}>{isDownloading ? 'Saving...' : 'Save PNG'}</Text>
              </LinearGradient>
            </Pressable>
            
            <Pressable style={styles.secondaryExportBtn} onPress={handleExportSVG} disabled={isDownloading}>
              <Ionicons name="logo-closed-captioning" size={20} color="#6e37d0" style={{ transform: [{rotate: '45deg'}] }} />
              <Text style={styles.secondaryExportText}>Export as Vector (SVG)</Text>
            </Pressable>
          </View>

          <View style={styles.secondaryActions}>
            <Pressable style={styles.actionCard} onPress={handleShare} disabled={isSharing}>
              {isSharing ? <ActivityIndicator color="#4d525c" size="small" /> : <Ionicons name="share-social-outline" size={20} color="#4d525c" />}
              <Text style={styles.actionCardText}>{isSharing ? 'Sharing...' : 'Share'}</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => router.push('/(tabs)/gallery')} disabled={isSharing || isDownloading}>
              <Ionicons name="images-outline" size={20} color="#4d525c" />
              <Text style={styles.actionCardText}>Gallery</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.createMoreCard} onPress={() => router.push('/style-selection')}>
            <View style={styles.createMoreIcon}>
              <Ionicons name="brush" size={24} color="#6e37d0" />
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
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#6e37d0' },
  
  previewSection: { marginBottom: 32 },
  imageContainer: {
    width: '100%', aspectRatio: 1, borderRadius: 32, overflow: 'hidden',
    backgroundColor: '#fff', marginBottom: 16,
    shadowColor: '#6e37d0', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  mainImage: { width: '100%', height: '100%' },
  sliderLine: {
    position: 'absolute', top: 0, bottom: 0, width: 4, marginLeft: -2,
    backgroundColor: '#fff', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  sliderHandle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8,
  },

  metadataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metadataItem: {
    flex: 1, minWidth: '45%', backgroundColor: '#e6e8eb', padding: 16, borderRadius: 16,
  },
  metadataLabel: {
    fontSize: 10, fontWeight: 'bold', color: '#abadaf', letterSpacing: 1, marginBottom: 4,
  },
  metadataValue: { fontSize: 16, fontWeight: 'bold', color: '#2c2f31' },
  
  actionSection: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: '#2c2f31', marginBottom: 8 },
  promptText: { fontSize: 14, color: '#575c66', lineHeight: 22, marginBottom: 28 },
  promptEmphasis: { fontStyle: 'italic', color: '#6e37d0', fontWeight: '500' },
  
  primaryButton: { borderRadius: 999, overflow: 'hidden' },
  gradientButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  secondaryExportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 12, borderRadius: 999,
    backgroundColor: 'rgba(110,55,208,0.08)', borderWidth: 1, borderColor: '#e4d8ff',
  },
  secondaryExportText: { color: '#6e37d0', fontSize: 16, fontWeight: 'bold' },

  secondaryActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
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
