import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useImageContext } from '@/contexts/image-context';

export default function ImageDetail() {
  const router = useRouter();
  const { selectedImage } = useImageContext();

  // Use selected image from context or fallback to placeholder
  const imageUri = selectedImage?.uri || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMgqA7CsE2yIFOXdPF00I0tzE9caboouSSxDlaUEEOUR2p_Gb5rca65LKFe-6Ma1_mM0Ovfif9falZHVU1Hg7GGWE96jRH7AIoYBZj55K7v4Vbg5XDn4IxOLh3cAeZUm6k3RmWLpgHDk-uLkxBkJbtcM71WRXGOLzJjLhvF0TqYUVDhNBfbMbEDZ4NsEuLYu1JlWl-P2EAIA_BQF4u7uOoDdCz-TMNC3-I0B6YJuM9CLRe3FUnCb7jXQHWPjuWC2odu_d7BZsKVr5o';
  const imageTitle = selectedImage?.title || 'Cosmic Alchemist Vial';
  const imageStyle = selectedImage?.style || 'Ethereal Glass';
  const imageDate = selectedImage
    ? new Date(selectedImage.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Oct 24, 2023';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this clipart I created with Digital Alchemist: "${imageTitle}" in ${imageStyle} style!`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant media library access to save images.');
        return;
      }

      let localUri = imageUri;

      // Handle base64 from HF or local cache
      if (imageUri.startsWith('data:image')) {
        const base64Data = imageUri.split(',')[1];
        const tempUri = FileSystem.cacheDirectory + `clipart_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(tempUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        localUri = tempUri;
      } else if (imageUri.startsWith('http')) {
        const tempUri = FileSystem.cacheDirectory + `clipart_${Date.now()}.png`;
        const { uri } = await FileSystem.downloadAsync(imageUri, tempUri);
        localUri = uri;
      }

      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('Magic Saved!', 'Your clipart has been saved to your photo gallery.');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Could not save the image.');
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
            <Text style={styles.headerTitle}>Digital Alchemist</Text>
          </View>
          <Pressable>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2dB9zcyajHPh3d4rpj5L3vlUstRQ5E-1OC8KHD7jSsAiwSrVmVLEwCmKUniwc2mRWkEP8zrO5kYEoE8gwqwJUdBcok5jTECNr2OgNTNawuGJGyRzjY0JWbNWcJLLsi-pZxhHTl4WBpbbmGwqo73tkKJbycaEPkgPN3nkrUdjuzX2tqe8SCCTFKiSDJTKgSccqvi8ni2XyjNDmk5TPc6xpNVKCppgkFbEZNRwtlrOLaLWeskpdfRS-aymHqiYdphsRin-PYamFLCbE' }}
              style={styles.profileImage}
            />
          </Pressable>
        </View>

        {/* Image Preview Area */}
        <View style={styles.previewSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.mainImage}
            />
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
            {selectedImage ? ' using HuggingFace AI' : ''}
          </Text>

          <View style={styles.primaryActions}>
            <Pressable style={styles.primaryButton} onPress={handleDownload}>
              <LinearGradient colors={['#6e37d0', '#b28cff']} style={styles.gradientButton}>
                <Ionicons name="download-outline" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>Download PNG</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.secondaryButton}>
              <Ionicons name="images-outline" size={24} color="#6e37d0" />
              <Text style={styles.secondaryButtonText}>Download SVG</Text>
            </Pressable>
          </View>

          <View style={styles.secondaryActions}>
            <Pressable style={styles.actionCard} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color="#4d525c" />
              <Text style={styles.actionCardText}>Share</Text>
            </Pressable>
            <Pressable style={styles.actionCard}>
              <Ionicons name="copy-outline" size={20} color="#4d525c" />
              <Text style={styles.actionCardText}>Copy Link</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.navigationSection}>
            <Pressable style={styles.backLink} onPress={() => router.push('/(tabs)/gallery')}>
              <Ionicons name="arrow-back" size={20} color="#575c66" />
              <Text style={styles.backLinkText}>Back to Library</Text>
            </Pressable>

            <Pressable style={styles.createMoreCard} onPress={() => router.push('/(tabs)')}>
              <View style={styles.createMoreIcon}>
                <Ionicons name="color-wand" size={24} color="#6e37d0" />
              </View>
              <View style={styles.createMoreTextContainer}>
                <Text style={styles.createMoreTitle}>Create More Like This</Text>
                <Text style={styles.createMoreSubtitle}>Keep the same style and seed</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#abadaf" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6e37d0',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(178,140,255,0.3)',
  },
  previewSection: {
    marginBottom: 40,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#6e37d0',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metadataItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#e6e8eb',
    padding: 16,
    borderRadius: 16,
  },
  metadataItemFull: {
    minWidth: '100%',
  },
  metadataLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#abadaf',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c2f31',
  },
  actionSection: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2c2f31',
    marginBottom: 12,
  },
  promptText: {
    fontSize: 14,
    color: '#575c66',
    lineHeight: 22,
    marginBottom: 32,
  },
  promptEmphasis: {
    fontStyle: 'italic',
    color: '#6e37d0',
    fontWeight: '500',
  },
  primaryActions: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(110,55,208,0.1)',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#6e37d0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dee2ee',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionCardText: {
    color: '#4d525c',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(171,173,175,0.2)',
    marginBottom: 32,
  },
  navigationSection: {
    gap: 24,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backLinkText: {
    color: '#575c66',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createMoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(178,140,255,0.1)',
  },
  createMoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(110,55,208,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  createMoreTextContainer: {
    flex: 1,
  },
  createMoreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c2f31',
    marginBottom: 4,
  },
  createMoreSubtitle: {
    fontSize: 12,
    color: '#575c66',
  },
});
