import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useImageContext } from '@/contexts/image-context';

export default function HomeUpload() {
  const router = useRouter();
  const { sourceImageUri, setSourceImageUri } = useImageContext();

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
      quality: 0.8, // Compress client-side
      base64: true, // We need base64 for API
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Validate format
      if (!asset.uri.match(/\.(jpeg|jpg|png|webp|heic)$/i) && !asset.mimeType?.match(/image\/(jpeg|jpg|png|webp|heic)/i)) {
        Alert.alert('Invalid Format', 'Please upload a JPEG, PNG, WEBP, or HEIC image.');
        return;
      }

      // Check file size (max ~10MB)
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select an image under 10MB.');
        return;
      }

      setSourceImageUri(asset.uri);
      // We could also store base64 in context if needed, or read it later
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
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please take a smaller photo or lower your camera resolution.');
        return;
      }

      setSourceImageUri(asset.uri);
      router.push('/style-selection');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Ionicons name="color-wand" size={24} color="#7D48DF" />
            <Text style={styles.headerTitle}>Digital Alchemist</Text>
          </View>
          <Pressable>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC40KguhlOJKfkZaY0-Ytln3W3bn0ZF2PWfqKb3lFJTXi3xnjW4J6cFBoWLD2WTN04o5d-qxTfwlldlkEaLfg9xoI2PTk9dqq9dV9mj0DtzpM-n9BOiobvOFJ_VHxsbJoxiLEP6BPO_gPdBJcw5WThm70gidz2pIJ_ARXWQ8-YqrRmJIMJReVeH1kuw2j6RGtPkyUBlSOxUBet8tEb_8F8S0OKCcMWXPmNaV9zb7EdtqB4hYw7tYn01BuT748PvFL_tIoYiWWmUcUUl' }}
              style={styles.profileImage}
            />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.eyebrow}>Studio Canvas</Text>
          <Text style={styles.heroTitle}>
            Turn photos into{'\n'}
            <Text style={styles.heroTitleHighlight}>magical clipart.</Text>
          </Text>
        </View>

        {/* Upload Bento Grid */}
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
              <Text style={styles.uploadSubtitle}>Upload a clear photo of an object or character to begin the alchemy.</Text>
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
          <Pressable style={styles.quickActionCard} onPress={pickImageFromLibrary}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="images" size={24} color="#6e37d0" />
            </View>
            <Text style={styles.quickActionText}>Browse Gallery</Text>
          </Pressable>
        </View>

        {/* Hint */}
        <View style={styles.hintBox}>
          <Ionicons name="bulb" size={24} color="#6e37d0" />
          <Text style={styles.hintText}>
            <Text style={styles.hintTextBold}>Pro Tip: </Text>
            For best results, use high-resolution JPG or PNG images with a simple background. Our AI works best with clear subjects.
          </Text>
        </View>

        {/* Recent Creations */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Creations</Text>
            <Pressable>
              <Text style={styles.recentLink}>View Library</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentList}>
            {[
              { title: 'Golden Pup', time: '2 hours ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIR9ngglypIdlnTmYGjvPEUy3ngSq2elgkzvDAzAsxd9kqkZS5pX--8Qn9m4S4RyV-_1q3stBG-Q93ZsYB1kLzqfcLwXue87C_PotEMdK5O18-OKrlU4TSQipZBmtZgHe3uSfCq1gUXcpYkiDtOw8DbOvTD-r_-I2pq375AZCh61Mb-9vskRmwlhz6aUfWSHVcVZJ8SnBEqQQ5hDzsRGcrk0WUrE5s_p710Y_Wpp6qhSvBp_0496Jb_e5IaBMiclqwFbt4O8ZFdilj' },
              { title: 'Morning Brew', time: 'Yesterday', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlzKh0vB0J5wC5mo4Gv3L8rsCT166H6SQ0WH0KYkGTYbDs-PQSdHZB_IWJdwwy64TIuS_ueKhtDSE64rGtln5tDASR0EmlnvoH1MCi158XScjHMY0FEvgVNbUO4efquzZrnrb-BwJNsJbhSGPbErAQ2BJuq6K2AotMqG3trmYZOrH9tkVp5rEaPXY9WIiMwBOLhVzbqmb2xlssHND2NzMAU9xBXVm96oCdnTq_XnUBtulMziUViYJDm1sVG2usnkZVLX-WX0BTqYbb' },
              { title: 'Mountain Peak', time: '3 days ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgseq8sIUN6MYPEg3E7lDIhP3TNdpmz7fyXKcWeRDSGOXofADsEbLUsKzG9-OGO6U9hamN1M0g6LnL3pUYicNZ53Z5E53z84UO6e8LjIf6L3m8T5AJaly7_EiCkyiAhzFs9tsBnj0j23uXNsczLpWzhRcCh9dBdfMEbJFeIw3uiD1e87yClIBCwzcmuOELgTivPu1P2OA2V7hsTZ1gf228aorU23v1vMLaY9yYnm7BInx9jDH81J9aWcFjXPoh-ZUvORouCfHum6XY' },
            ].map((item, i) => (
              <Pressable key={i} style={styles.recentCard}>
                <Image source={{ uri: item.img }} style={styles.recentImage} />
                <Text style={styles.recentCardTitle}>{item.title}</Text>
                <Text style={styles.recentCardTime}>{item.time}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tutorial */}
        <View style={styles.tutorialSection}>
          <Text style={styles.tutorialTitle}>Master the{'\n'}Alchemy.</Text>
          <Text style={styles.tutorialSubtitle}>Learn how to get the most out of our AI generator with these quick tips on lighting, framing, and style selection.</Text>
          <Pressable style={styles.tutorialButton}>
            <Text style={styles.tutorialButtonText}>Watch Tutorials</Text>
          </Pressable>
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
    marginBottom: 40,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
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
  heroSection: {
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6e37d0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#2c2f31',
    lineHeight: 48,
  },
  heroTitleHighlight: {
    color: '#6226c3',
  },
  uploadArea: {
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(171,173,175,0.2)',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  uploadPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    marginBottom: 16,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(178,140,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c2f31',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#575c66',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#eff1f3',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontWeight: 'bold',
    color: '#2c2f31',
  },
  hintBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(110,55,208,0.05)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(110,55,208,0.1)',
    marginBottom: 40,
    gap: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: '#575c66',
    lineHeight: 20,
  },
  hintTextBold: {
    fontWeight: 'bold',
    color: '#6226c3',
  },
  recentSection: {
    marginBottom: 40,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  recentTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c2f31',
  },
  recentLink: {
    color: '#6e37d0',
    fontWeight: 'bold',
  },
  recentList: {
    overflow: 'visible',
  },
  recentCard: {
    width: 140,
    marginRight: 16,
  },
  recentImage: {
    width: 140,
    height: 140,
    borderRadius: 24,
    backgroundColor: '#e0e3e5',
    marginBottom: 12,
  },
  recentCardTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2c2f31',
  },
  recentCardTime: {
    fontSize: 12,
    color: '#575c66',
  },
  tutorialSection: {
    backgroundColor: '#e6e8eb',
    borderRadius: 40,
    padding: 32,
  },
  tutorialTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    color: '#2c2f31',
  },
  tutorialSubtitle: {
    color: '#575c66',
    marginBottom: 24,
    lineHeight: 22,
  },
  tutorialButton: {
    backgroundColor: '#dee2ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  tutorialButtonText: {
    fontWeight: 'bold',
    color: '#4d525c',
  },
});
