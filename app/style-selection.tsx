import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useImageContext, type GeneratedImage } from '@/contexts/image-context';
import { generateClipart } from '@/services/leonardo';

const stylesList = [
  { name: 'Cartoon', icon: '🎨' },
  { name: 'Flat Illustration', icon: '📐' },
  { name: 'Anime', icon: '⚡' },
  { name: 'Pixel Art', icon: '👾' },
  { name: 'Sketch / Outline', icon: '✏️' },
];

/** Skeleton card while a style is generating */
function SkeletonCard({ label }: { label: string }) {
  const animValue = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 0.7, duration: 900, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.resultCard}>
      <Animated.View style={[styles.resultCardImgSkeleton, { opacity: animValue }]} />
      <Text style={styles.resultCardTitle}>{label}</Text>
      <Text style={styles.resultCardSub}>Generating...</Text>
    </View>
  );
}

export default function StyleSelection() {
  const router = useRouter();
  const {
    sourceImageUri,
    setSourceImageUri,
    setGeneratedImages,
    setIsGenerating,
    setProgress,
    setActivePrompt,
    setSelectedImage,
  } = useImageContext();

  const [selectedStyles, setSelectedStyles] = useState<string[]>(stylesList.map(s => s.name));
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [results, setResults] = useState<Map<string, GeneratedImage | 'loading' | null>>(new Map());

  const toggleStyle = (name: string) => {
    setSelectedStyles(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const selectAll = () => {
    if (selectedStyles.length === stylesList.length) {
      setSelectedStyles([]);
    } else {
      setSelectedStyles(stylesList.map(s => s.name));
    }
  };

  /** Let user pick a different image */
  const handleChangeImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSourceImageUri(result.assets[0].uri);
      // Clear previous results
      setResults(new Map());
      setCompletedCount(0);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImageUri) {
      Alert.alert('No Image', 'Please upload or capture an image first.');
      return;
    }
    if (selectedStyles.length === 0) {
      Alert.alert('No Styles Selected', 'Please select at least one alchemy style.');
      return;
    }

    setIsLoading(true);
    setIsGenerating(true);
    setProgress(0);
    setCompletedCount(0);
    setActivePrompt(customPrompt || 'a beautiful illustration');

    const initialMap = new Map<string, GeneratedImage | 'loading' | null>();
    selectedStyles.forEach(s => initialMap.set(s, 'loading'));
    setResults(initialMap);

    try {
      let imageBase64: string | undefined;
      try {
        imageBase64 = await FileSystem.readAsStringAsync(sourceImageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (err) {
        Alert.alert('Error', 'Could not read the selected image. Please try a different one.');
        setIsLoading(false);
        setIsGenerating(false);
        return;
      }

      const allResults: GeneratedImage[] = [];
      let completed = 0;

      const promises = selectedStyles.map(async (style) => {
        try {
          const uri = await generateClipart(style, customPrompt || undefined, imageBase64);
          const img: GeneratedImage = { uri, title: style, style, timestamp: Date.now() };
          allResults.push(img);
          setResults(prev => {
            const next = new Map(prev);
            next.set(style, img);
            return next;
          });
        } catch (error: any) {
          console.warn(`Failed to generate ${style}:`, error);
          setResults(prev => {
            const next = new Map(prev);
            next.set(style, null);
            return next;
          });
        }
        completed++;
        setCompletedCount(completed);
        setProgress(Math.round((completed / selectedStyles.length) * 100));
      });

      await Promise.all(promises);

      setGeneratedImages(allResults);
      setIsGenerating(false);
      setProgress(100);
    } catch (error) {
      Alert.alert('Generation Failed', 'Something went wrong. Please try again.');
      console.error('Generation error:', error);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const completedResults = Array.from(results.entries()).filter(
    ([_, v]) => v !== null && v !== 'loading'
  ) as [string, GeneratedImage][];

  const hasAnyResult = completedResults.length > 0 || isLoading;

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
            <Text style={styles.headerTitle}>Style Selection</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Source Image Preview with Change button */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageWrapper}>
            <Image
              source={
                sourceImageUri
                  ? { uri: sourceImageUri }
                  : undefined
              }
              style={styles.heroImage}
            />
            {sourceImageUri && (
              <View style={styles.heroOverlay}>
                <Pressable style={styles.changeImageBtn} onPress={handleChangeImage}>
                  <Ionicons name="camera-reverse" size={18} color="#fff" />
                  <Text style={styles.changeImageText}>Change</Text>
                </Pressable>
              </View>
            )}
          </View>
          {!sourceImageUri && (
            <Pressable style={styles.uploadPrompt} onPress={handleChangeImage}>
              <Ionicons name="cloud-upload" size={32} color="#6e37d0" />
              <Text style={styles.uploadPromptText}>Tap to select an image</Text>
            </Pressable>
          )}
        </View>

        {/* Style Selection */}
        <View style={styles.styleSection}>
          <View style={styles.styleSectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Choose Styles</Text>
              <Text style={styles.sectionSubtitle}>
                {selectedStyles.length}/{stylesList.length} selected
              </Text>
            </View>
            <Pressable style={styles.selectAllBtn} onPress={selectAll}>
              <Text style={styles.selectAllText}>
                {selectedStyles.length === stylesList.length ? 'Deselect All' : 'Select All'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.styleGrid}>
            {stylesList.map((item) => {
              const isActive = selectedStyles.includes(item.name);
              return (
                <Pressable
                  key={item.name}
                  style={[styles.styleChip, isActive && styles.styleChipActive]}
                  onPress={() => toggleStyle(item.name)}
                >
                  <Text style={styles.styleChipIcon}>{item.icon}</Text>
                  <Text style={[styles.styleChipText, isActive && styles.styleChipTextActive]}>
                    {item.name}
                  </Text>
                  {isActive && <Ionicons name="checkmark-circle" size={18} color="#6e37d0" />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Prompt */}
        <View style={styles.configSection}>
          <View style={styles.configCard}>
            <Text style={styles.configTitle}>Describe your vision</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g. a cute golden retriever puppy"
                placeholderTextColor="#abadaf"
                value={customPrompt}
                onChangeText={setCustomPrompt}
                multiline
              />
              <Ionicons name="color-wand" size={20} color="#abadaf" style={styles.inputIcon} />
            </View>
          </View>
        </View>

        {/* Generate Button */}
        <View style={styles.ctaSection}>
          <Pressable onPress={handleGenerate} disabled={isLoading || !sourceImageUri || selectedStyles.length === 0}>
            <LinearGradient
              colors={isLoading || !sourceImageUri || selectedStyles.length === 0 ? ['#a0a0a0', '#c0c0c0'] : ['#6e37d0', '#b28cff']}
              style={styles.generateButton}
            >
              {isLoading ? (
                <View style={styles.buttonContentRow}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.generateButtonText}>
                    Generating {completedCount}/{selectedStyles.length}...
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonContentRow}>
                  <Ionicons name="sparkles" size={22} color="#fff" />
                  <Text style={styles.generateButtonText}>
                    {selectedStyles.length === 0
                      ? 'Select a Style'
                      : `Generate ${selectedStyles.length} Style${selectedStyles.length !== 1 ? 's' : ''}`}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>

          {/* Progress bar during generation */}
          {isLoading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round((completedCount / selectedStyles.length) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {completedCount === selectedStyles.length
                  ? 'All done! ✨'
                  : `Generating style ${completedCount + 1} of ${selectedStyles.length}...`}
              </Text>
            </View>
          )}
        </View>

        {/* Results Grid */}
        {hasAnyResult && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsSectionTitle}>Results</Text>
            <View style={styles.resultsGrid}>
              {selectedStyles.map((styleName) => {
                const value = results.get(styleName);
                if (value === 'loading') {
                  return <SkeletonCard key={styleName} label={styleName} />;
                }
                if (value && typeof value === 'object' && value.uri) {
                  return (
                    <Pressable
                      key={styleName}
                      style={styles.resultCard}
                      onPress={() => {
                        setSelectedImage(value);
                        router.push('/image-detail');
                      }}
                    >
                      <Image source={{ uri: value.uri }} style={styles.resultCardImg} />
                      <Text style={styles.resultCardTitle}>{styleName}</Text>
                      <Text style={[styles.resultCardSub, { color: '#10b981' }]}>Tap to view</Text>
                    </Pressable>
                  );
                }
                if (value === null) {
                  return (
                    <View key={styleName} style={styles.resultCard}>
                      <View style={[styles.resultCardImgSkeleton, { backgroundColor: '#fecaca' }]}>
                        <Ionicons name="alert-circle" size={24} color="#ef4444" />
                      </View>
                      <Text style={styles.resultCardTitle}>{styleName}</Text>
                      <Text style={[styles.resultCardSub, { color: '#ef4444' }]}>Failed</Text>
                    </View>
                  );
                }
                return null;
              })}
            </View>

            {!isLoading && completedResults.length > 0 && (
              <Pressable onPress={() => router.push('/(tabs)/gallery')}>
                <LinearGradient colors={['#6e37d0', '#b28cff']} style={styles.viewGalleryBtn}>
                  <Ionicons name="images" size={20} color="#fff" />
                  <Text style={styles.viewGalleryText}>View All in Gallery</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        )}
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
  backButton: { padding: 8, marginLeft: -8 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#6e37d0' },
  // Hero
  heroSection: { marginBottom: 24 },
  heroImageWrapper: {
    borderRadius: 24, overflow: 'hidden', backgroundColor: '#e6e8eb',
  },
  heroImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: 24 },
  heroOverlay: {
    position: 'absolute', bottom: 12, right: 12,
  },
  changeImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999,
  },
  changeImageText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  uploadPrompt: {
    alignItems: 'center', justifyContent: 'center', padding: 40,
    backgroundColor: '#fff', borderRadius: 24, borderWidth: 2,
    borderColor: 'rgba(110,55,208,0.15)', borderStyle: 'dashed',
  },
  uploadPromptText: { marginTop: 12, color: '#6e37d0', fontWeight: 'bold', fontSize: 15 },
  // Styles
  styleSection: { marginBottom: 24 },
  styleSectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#2c2f31', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#575c66' },
  selectAllBtn: {
    backgroundColor: 'rgba(110,55,208,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
  },
  selectAllText: { color: '#6e37d0', fontWeight: 'bold', fontSize: 12 },
  styleGrid: { gap: 8 },
  styleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', padding: 14, borderRadius: 16,
    borderWidth: 2, borderColor: 'transparent',
  },
  styleChipActive: { borderColor: '#6e37d0', backgroundColor: 'rgba(110,55,208,0.04)' },
  styleChipIcon: { fontSize: 20 },
  styleChipText: { flex: 1, fontWeight: '600', color: '#575c66', fontSize: 15 },
  styleChipTextActive: { color: '#6e37d0', fontWeight: 'bold' },
  // Config
  configSection: { marginBottom: 24 },
  configCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  configTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c2f31', marginBottom: 12 },
  inputContainer: { position: 'relative' },
  input: {
    backgroundColor: '#eff1f3', borderRadius: 12, padding: 14, paddingRight: 48,
    fontSize: 14, fontWeight: '500', color: '#2c2f31', minHeight: 50,
  },
  inputIcon: { position: 'absolute', right: 16, top: 14 },
  // CTA
  ctaSection: { alignItems: 'center', marginBottom: 24 },
  generateButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 36, paddingVertical: 18, borderRadius: 999, gap: 10,
    width: '100%',
  },
  generateButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  buttonContentRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  progressContainer: { width: '100%', marginTop: 16, alignItems: 'center' },
  progressTrack: {
    width: '100%', height: 6, backgroundColor: '#e6e8eb', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: '#6e37d0', borderRadius: 3,
  },
  progressText: { marginTop: 8, fontSize: 12, color: '#575c66', fontWeight: '600' },
  // Results
  resultsSection: { marginTop: 8 },
  resultsSectionTitle: { fontSize: 22, fontWeight: '800', color: '#2c2f31', marginBottom: 16 },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  resultCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 10, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
  },
  resultCardImg: { width: '100%', aspectRatio: 1, borderRadius: 14, marginBottom: 8 },
  resultCardImgSkeleton: {
    width: '100%', aspectRatio: 1, borderRadius: 14, marginBottom: 8,
    backgroundColor: '#dadde0', alignItems: 'center', justifyContent: 'center',
  },
  resultCardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2c2f31' },
  resultCardSub: { fontSize: 11, color: '#abadaf', fontWeight: '600', marginTop: 2 },
  viewGalleryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 999, gap: 10, marginTop: 8,
  },
  viewGalleryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
