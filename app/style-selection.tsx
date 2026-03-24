import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useImageContext, type GeneratedImage } from '@/contexts/image-context';
import { generateClipart } from '@/services/huggingface';

const stylesList = [
  { name: 'Cartoon', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo7lERzFv8EjnOyIZ80yLWt5guoP3GYNypKyKw8VjHKUPXfd1-Z0qYjGZbOKp-G6SMZkfOKCxazUVXzEMxGXdsyIWKK7f_GD3nxTtnakUtN9vS3jLCQy_Xf8q4d0_QWxoPPXl1hHqT_6Ps0UA8LOXxFoawa41MJImZgFwvIfLUazd0bPtFD46gMXtOsDoE7ZXhTZxh8O9Y0cYx8zfGs35mLcjWT8oj2FhWIlO06UrKfG-QmvQTek1hMZtf4RE7s5HPE0MNNt7KTpnB' },
  { name: 'Flat Illustration', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo4MDmFZh4aY-L6HQd1iw2xuOeLBJ51PKYl3SBuMVSUdcGr_NFS-v6EWcFoQIGkL_WNo68T1fXXU0uAVU4pJC_Or3n46CWK3YL9fc09TKc21Lz8filhgwmDxrLqu46J22NJnhkMl4oAWhXG7rvYpjL8I2GIfY2AKFAz_YPpqsiJWzZDXv83lzN5wlIn7MAceFE7cCmTQJBK-h-CQuP-RiU3lJwj4XG5B9SxNPsCYCH-KEU5v7nXpFwLqYeIpn7C1TotJOYOzQw7BsQ' },
  { name: 'Anime', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPrC8BX0vuJ05pzSSLVG9FQ1wbVKROCZHGHIHy0MtWcBe0YYV5WhQLXp4HyIQd-5hKx6cPUUd8KYpy-0K00lsfBpgrdo6U_9LBSVj1d2QE58qRwE9VW7o3vWssWn789Ren9vOv35mr-Lec12TpJ9K3C7q4d9GKYwJISap4efErGKq8V5_0t4twjEKY-beiuT4j38KCMZzcFff1v_6pqy7yiztKTPpZmR5rfMgV6wqfhbHI-b8yqtVuP_FqwOktlerKhOGVqToTaZ_t' },
  { name: 'Pixel Art', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmmUIrq_gt65Pwry4ofJdyo-rSN3mFu_zILLSUWy1_DNDkpoXXgZCaA4hhsZIR7gVUM3dBLmwTNL0kF82CZlQxDK5yXZiPXkGGQCCPraLhEFj4Upz1IPjzEXS7np92C8Jwl_7eytnpd4_nagXm-10bRjfD_9_Uc9zhRAfZmMUUfC47DOBHaBFArFPuC11ixyThPj6y5uoWYSk-DJ4x-V3-JRdC9ObhLamSk8xHZEblVWHH57qlhU4akEvHUSxZEVTx3LjzeQNVYsyh' },
  { name: 'Sketch / Outline', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByUVapSIx4OorBTcwU2h3731t_h4VpJjbNYqMgfyb3UZKoTzevmBklqCqlvkD31Sy3PippN12JPFgrqx0xmqXtso4X-uem2YE--tTLXBYfu14b37jOzSMA-needJAp7Q-NTyT2iqyVN_YfzsweyVtUt5DFtGdJPLxzRKl45wo75bX9M2Q_113B3GLVr1JSnvDvCYxl0sxdKHT7a27HPnOBKEJZIkZlNBzNzs2rhdGDIkFA8kTh6Onfhn3ydsH962S60hS1h9DgIz_G' },
];

/** Inline skeleton card shown while a style is generating */
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
    setGeneratedImages,
    setIsGenerating,
    setProgress,
    setActivePrompt,
    setSelectedImage,
  } = useImageContext();

  const [selectedStyles, setSelectedStyles] = useState<string[]>(stylesList.map(s => s.name)); // all selected by default
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Track per-style status: null = pending, 'loading' = in progress, GeneratedImage = done
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

  const handleGenerate = async () => {
    if (selectedStyles.length === 0) {
      Alert.alert('No Styles Selected', 'Please select at least one alchemy style.');
      return;
    }

    setIsLoading(true);
    setIsGenerating(true);
    setProgress(0);
    setActivePrompt(customPrompt || 'a beautiful illustration');

    // Initialize result map for skeletons
    const initialMap = new Map<string, GeneratedImage | 'loading' | null>();
    selectedStyles.forEach(s => initialMap.set(s, 'loading'));
    setResults(initialMap);

    try {
      // Read source image as base64 if we have one
      let imageBase64: string | undefined;
      if (sourceImageUri) {
        try {
          imageBase64 = await FileSystem.readAsStringAsync(sourceImageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (err) {
          console.warn('Could not read source image as base64, falling back to text2img:', err);
        }
      }

      const allResults: GeneratedImage[] = [];

      // Generate all styles in parallel
      const promises = selectedStyles.map(async (style, i) => {
        try {
          const uri = await generateClipart(style, customPrompt || undefined, imageBase64);
          const img: GeneratedImage = { uri, title: style, style, timestamp: Date.now() };
          allResults.push(img);
          setResults(prev => {
            const next = new Map(prev);
            next.set(style, img);
            return next;
          });
        } catch (error) {
          console.warn(`Failed to generate ${style}:`, error);
          setResults(prev => {
            const next = new Map(prev);
            next.set(style, null); // mark as failed
            return next;
          });
        }
        setProgress(Math.round(((allResults.length) / selectedStyles.length) * 100));
      });

      await Promise.all(promises);

      setGeneratedImages(allResults);
      setIsGenerating(false);
      setProgress(100);
    } catch (error) {
      Alert.alert('Generation Failed', 'Something went wrong. Please check your API token and try again.');
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
            <Text style={styles.headerTitle}>Digital Alchemist</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Preview - Show picked image */}
        <View style={styles.heroSection}>
          <Image
            source={
              sourceImageUri
                ? { uri: sourceImageUri }
                : { uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsb4lICMlPksEIqRmYEbSA8Gr79Q4jCxIHyXm6tCU4_6qsJmAzGfl-rRgfzauOAn9DUd4qGVyxOEFOWVzSHwkHucyuO2kUlIbL9dkwHD2k3FDTF-FAvBS4BNjTci2QcjAJgWBt8MLWlCmYUJNNeAviiFIvfwl0mhxP6eFMiQZLeumVw0YtWY5c9a0FSNrHEzzGZMUNCoBGQc6hGjyWxX_y17vAsyfkO4gH51Z1_LRjAYd3XEJitOe6qBryuAmX-xFek77w3YYRO7Jp' }
            }
            style={styles.heroImage}
          />
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>
              {sourceImageUri ? 'YOUR IMAGE' : 'NO IMAGE SELECTED'}
            </Text>
          </View>
        </View>

        {/* Style Selection — Multi-select */}
        <View style={styles.styleSection}>
          <View style={styles.styleSectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Alchemy Styles</Text>
              <Text style={styles.sectionSubtitle}>
                Tap to select styles ({selectedStyles.length}/{stylesList.length})
              </Text>
            </View>
            <Pressable style={styles.selectAllBtn} onPress={selectAll}>
              <Text style={styles.selectAllText}>
                {selectedStyles.length === stylesList.length ? 'Deselect All' : 'Select All'}
              </Text>
            </Pressable>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleList}>
            {stylesList.map((item, i) => {
              const isActive = selectedStyles.includes(item.name);
              return (
                <Pressable key={i} style={styles.styleCard} onPress={() => toggleStyle(item.name)}>
                  <View style={[styles.styleImageContainer, isActive && styles.styleImageActive]}>
                    <Image source={{ uri: item.img }} style={styles.styleImage} />
                    {isActive && (
                      <View style={styles.activeOverlay}>
                        <Ionicons name="checkmark-circle" size={32} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.styleName, isActive && styles.styleNameActive]}>{item.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Prompt Customization */}
        <View style={styles.configSection}>
          <View style={styles.configCard}>
            <Text style={styles.configTitle}>Alchemy Prompt</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Describe what you want to create..."
                placeholderTextColor="#abadaf"
                value={customPrompt}
                onChangeText={setCustomPrompt}
                multiline
              />
              <Ionicons name="color-wand" size={20} color="#abadaf" style={styles.inputIcon} />
            </View>
            <Text style={styles.inputHint}>Example: "a cute golden retriever puppy, vibrant gradients"</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Pressable onPress={handleGenerate} disabled={isLoading}>
            <LinearGradient 
              colors={isLoading ? ['#a0a0a0', '#c0c0c0'] : ['#6e37d0', '#b28cff']} 
              style={styles.generateButton}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.generateButtonText}>Generating {selectedStyles.length} styles...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="star" size={24} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate {selectedStyles.length} Clipart{selectedStyles.length !== 1 ? 's' : ''}</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
          <Text style={styles.estimatedTime}>
            {isLoading
              ? 'AI is working its magic...'
              : `Est. ~${selectedStyles.length * 8}s for ${selectedStyles.length} style${selectedStyles.length !== 1 ? 's' : ''}`}
          </Text>
        </View>

        {/* Inline Results Grid (skeleton + completed) */}
        {hasAnyResult && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsSectionTitle}>Generated Variants</Text>
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
                      <Text style={[styles.resultCardSub, { color: '#10b981' }]}>Complete</Text>
                    </Pressable>
                  );
                }
                // failed
                if (value === null && isLoading) {
                  return <SkeletonCard key={styleName} label={styleName} />;
                }
                return (
                  <View key={styleName} style={styles.resultCard}>
                    <View style={[styles.resultCardImgSkeleton, { backgroundColor: '#fecaca' }]} />
                    <Text style={styles.resultCardTitle}>{styleName}</Text>
                    <Text style={[styles.resultCardSub, { color: '#ef4444' }]}>Failed</Text>
                  </View>
                );
              })}
            </View>

            {!isLoading && completedResults.length > 0 && (
              <Pressable onPress={() => router.push('/(tabs)/gallery')}>
                <LinearGradient colors={['#6e37d0', '#b28cff']} style={styles.viewGalleryBtn}>
                  <Ionicons name="images" size={20} color="#fff" />
                  <Text style={styles.viewGalleryText}>View in Gallery</Text>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32,
  },
  backButton: { padding: 8, marginLeft: -8 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#6e37d0' },
  heroSection: {
    marginBottom: 32, borderRadius: 32, backgroundColor: '#fff', padding: 16,
    shadowColor: '#6e37d0', shadowOpacity: 0.1, shadowRadius: 20,
  },
  heroImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: 24 },
  heroTag: {
    position: 'absolute', top: 32, left: 32, backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  heroTagText: { color: '#6e37d0', fontWeight: 'bold', fontSize: 10, letterSpacing: 1 },
  styleSection: { marginBottom: 32 },
  styleSectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16,
  },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#2c2f31', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#575c66' },
  selectAllBtn: {
    backgroundColor: 'rgba(110,55,208,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
  },
  selectAllText: { color: '#6e37d0', fontWeight: 'bold', fontSize: 12 },
  styleList: { overflow: 'visible' },
  styleCard: { width: 120, marginRight: 16 },
  styleImageContainer: {
    width: 120, height: 120, borderRadius: 24, overflow: 'hidden', marginBottom: 12, backgroundColor: '#e6e8eb',
  },
  styleImageActive: { borderWidth: 4, borderColor: '#6e37d0' },
  styleImage: { width: '100%', height: '100%' },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(110,55,208,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  styleName: { fontSize: 12, fontWeight: 'bold', color: '#575c66', textAlign: 'center' },
  styleNameActive: { color: '#6e37d0' },
  configSection: { marginBottom: 32 },
  configCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  configTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c2f31', marginBottom: 16 },
  inputContainer: { position: 'relative', marginBottom: 12 },
  input: {
    backgroundColor: '#eff1f3', borderRadius: 12, padding: 16, paddingRight: 48,
    fontSize: 14, fontWeight: '500', color: '#2c2f31', minHeight: 56,
  },
  inputIcon: { position: 'absolute', right: 16, top: 16 },
  inputHint: { fontSize: 12, color: '#575c66', fontStyle: 'italic' },
  ctaSection: { alignItems: 'center', marginBottom: 32 },
  generateButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, paddingVertical: 20, borderRadius: 999, gap: 12,
  },
  generateButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  estimatedTime: { marginTop: 16, fontSize: 12, color: '#abadaf', fontWeight: '500' },
  // Results grid (inline)
  resultsSection: { marginTop: 8 },
  resultsSectionTitle: { fontSize: 22, fontWeight: '800', color: '#2c2f31', marginBottom: 16 },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  resultCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 24, padding: 12, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
  },
  resultCardImg: { width: '100%', aspectRatio: 1, borderRadius: 16, marginBottom: 8 },
  resultCardImgSkeleton: {
    width: '100%', aspectRatio: 1, borderRadius: 16, marginBottom: 8, backgroundColor: '#dadde0',
  },
  resultCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#2c2f31' },
  resultCardSub: { fontSize: 11, color: '#abadaf', fontWeight: '600', marginTop: 2 },
  viewGalleryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 999, gap: 10, marginTop: 8,
  },
  viewGalleryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
