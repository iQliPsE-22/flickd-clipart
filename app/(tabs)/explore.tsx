import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const stylesList = [
  { name: 'Cartoon', icon: '🎨', desc: 'Vibrant colors, bold outlines, and playful designs.' },
  { name: 'Flat Illustration', icon: '📐', desc: 'Clean vector aesthetics with minimal shadows.' },
  { name: 'Anime', icon: '⚡', desc: 'Japanese animation style with cel-shading.' },
  { name: 'Pixel Art', icon: '👾', desc: 'Nostalgic 16-bit retro game aesthetic.' },
  { name: 'Sketch', icon: '✏️', desc: 'Hand-drawn pencil outline and minimalism.' },
];

export default function TipsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Ionicons name="book" size={24} color="#7D48DF" />
            <Text style={styles.headerTitle}>Tips & Styles</Text>
          </View>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Master the Alchemy</Text>
          <Text style={styles.heroSubtitle}>Learn how to get the best results from your photos.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Upload a Clear Photo</Text>
              <Text style={styles.stepDesc}>For best results, use a high-resolution image with a simple background.</Text>
            </View>
          </View>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Choose Your Styles</Text>
              <Text style={styles.stepDesc}>Select one or multiple styles. Add an optional prompt to guide the AI.</Text>
            </View>
          </View>
          
          <View style={styles.stepCard}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Generate & Save</Text>
              <Text style={styles.stepDesc}>Wait for the magic to happen, then save or share your favorite variations.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Styles</Text>
          {stylesList.map((item, index) => (
            <View key={index} style={styles.styleCard}>
              <Text style={styles.styleIcon}>{item.icon}</Text>
              <View style={styles.styleContent}>
                <Text style={styles.styleTitle}>{item.name}</Text>
                <Text style={styles.styleDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.proTip}>
          <Ionicons name="bulb" size={20} color="#6e37d0" />
          <Text style={styles.proTipText}>
            <Text style={{fontWeight: 'bold'}}>Pro Tip: </Text>
            The cleaner your original photo, the better the AI can recognize the subject and apply the style accurately.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f8' },
  container: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 32 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#6e37d0' },
  heroSection: { marginBottom: 32 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#2c2f31', marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: '#575c66', lineHeight: 22 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#2c2f31', marginBottom: 16 },
  stepCard: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16,
    marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#6e37d0',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  stepNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c2f31', marginBottom: 4 },
  stepDesc: { fontSize: 13, color: '#575c66', lineHeight: 20 },
  styleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff1f3',
    padding: 16, borderRadius: 16, marginBottom: 12,
  },
  styleIcon: { fontSize: 24, marginRight: 16 },
  styleContent: { flex: 1 },
  styleTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c2f31', marginBottom: 2 },
  styleDesc: { fontSize: 13, color: '#575c66' },
  proTip: {
    flexDirection: 'row', backgroundColor: 'rgba(110,55,208,0.05)', padding: 16,
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(110,55,208,0.1)', gap: 12,
  },
  proTipText: { flex: 1, fontSize: 13, color: '#6e37d0', lineHeight: 20 },
});
