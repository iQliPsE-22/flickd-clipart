import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useImageContext } from '@/contexts/image-context';
import { SkeletonGrid } from '@/components/SkeletonGrid';

export default function Gallery() {
  const router = useRouter();
  const { generatedImages, isGenerating, activePrompt, setSelectedImage } = useImageContext();

  const hasGenerated = generatedImages.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.iconBg}>
              <Ionicons name="color-wand" size={24} color="#7D48DF" />
            </View>
            <Text style={styles.headerTitle}>Digital Alchemist</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.historyBtn}>
              <Ionicons name="time" size={24} color="#575c66" />
            </Pressable>
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
            <SkeletonGrid />
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
                    <View>
                      <Text style={styles.cardTitle}>{img.title}</Text>
                      <Text style={styles.cardSubtitle}>{img.style}</Text>
                    </View>
                    <Pressable style={styles.downloadIcon}>
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

        {/* Prompt Bar — shows real prompt */}
        {hasGenerated && (
          <View style={styles.promptBarContainer}>
            <View style={styles.promptBar}>
              <Ionicons name="color-wand" size={24} color="#abadaf" />
              <TextInput 
                style={styles.promptInput}
                value={activePrompt || 'a beautiful illustration'}
                editable={false}
              />
              <Pressable onPress={() => router.push('/(tabs)')}>
                <LinearGradient colors={['#6e37d0', '#b28cff']} style={styles.modifyButton}>
                  <Ionicons name="star" size={16} color="#fff" />
                  <Text style={styles.modifyButtonText}>Create New</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 32, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
  },
  cardImageContainer: {
    aspectRatio: 1, borderRadius: 24, overflow: 'hidden', marginBottom: 16, backgroundColor: '#e6e8eb',
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
  // Prompt bar
  promptBarContainer: { alignItems: 'center' },
  promptBar: {
    width: '100%', backgroundColor: '#fff', borderRadius: 999, padding: 8, paddingLeft: 24,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#6e37d0', shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
    borderWidth: 1, borderColor: 'rgba(110,55,208,0.1)',
  },
  promptInput: { flex: 1, marginHorizontal: 12, fontSize: 14, fontWeight: '500', color: '#2c2f31' },
  modifyButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 999, gap: 8,
  },
  modifyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
