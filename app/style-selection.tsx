import { useImageContext } from "@/contexts/image-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const stylesList = [
  {
    name: "Cartoon",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwxY0IJGDUFeAVVPITl8ywHYpEu5xesjAXjpDnZAxeRSj6JIi0eRIiHg0X--1TWoiLGSYKeJqWO4-fkSx140xqpqBbGgommU338jScPbI_U1ywLYVg6TRxRwbxAT8SgauuPcHtpzsaPScK7llp_A5wZ5i0FyLDiVp07x1UJuSNbcPs8YJ89np24I8ik8NxuaKrvMw_Gbg5e_v8NVex_Cvv9ZpZMMEeoyaIG0mI78afNF9NRvp3eB6zVqAmd7sdeYiSJ4iUxjz7dUrE",
  },
  {
    name: "Flat Illustration",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBIn-m-Pr0qkfw9MwW1Czxcm1luiUYEGYrfcf1_8aaGC5G_XlA2cIkpCjZCyj6b2uf26tVga0Ie4xte1f-tMLZnEs1v1lsWzmIJQilJfY1NTL_edWW-xCfU1N5MQq4Z1fNR2iEr1sdyfSf1_Ye7WtpMc26CfXCvRFGsFJGNgu6KTSUQGGZL25FGN8xgeRbCP2DDbLvEeZTgF-FAc4UMVG1sspEHGMSiT4WC7bMzRf8iVQUSV5_iKgvA8Mqy_stde6Va00KXfzmzB7fV",
  },
  {
    name: "Anime",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBeMubvvdH-TVG5i62nuir8Lpt0I90igS8tvIWYNewrWZJ64pZ4uVFB8qb0au21WbIH7UnoegjfSlfHk5Z6X2sj0_IVCtx-l2OTdawyhw-tshhfkD1_pXoa7leA81VPRDDBRrCPdj-WR70qJaSJhTybxaJWOcxhidIFjvleFVJSo8Bw65r3o-0XWV6rau0bVcA9oHLB3S59ZgeUu5VU8lGvyBrRaVZZvavMCNaAQWm49CLXHwjKlPBylt_E50DFNboEFtPEB6SB3t9u",
  },
  {
    name: "Pixel Art",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA79C7yUDAZdjzTXDqOHAUIVeq1JQljqCtyBHz1qhJZifM2oIvlyN_JTNLCKbcDYRbCD2Q3SULHqb09xKiq1g1tazizenTX9ABa_1MwE4NoqjA6mRTt_JbCFIbUNCZ97maSokIKTTSCY9twmdXpOMoOx76lkISIM3tNRIEaSDYGmeV0kjH46brw5cMGI6cuvQyhnpp2sHTc_d9oVmpBr3i6J0h7dqnRzr3leEYrnu3O_HWRp3cnurW-IhZEZ_Rv_GhakWQnBwEiVVw2",
  },
  {
    name: "Sketch / Outline",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdC4kMPnVYfC-GnV4xOjZDotqDq7rqbq5JINTj557RCdMBRjJU2PFfYO9Z7tJQzfH4TI8n2ZsyVUYWJP8T1eEs28hHxclz78pXHI88MRAfM1PebYkzZ5eznyl_Tc-n6u7KlG6YtyTvvSm13Gztmi_MNUq4PlKVNQ0XyRd3suJcc3Pa_3nQcQMrYdRFXNfW_6E8y2YCOAoscE_WVfG3HW160wf-B5Ic4yvJdOY0niz-yo7CAsu8V3J0Do9fD4E-y_bOcoGvjIdahx-e",
  },
];

export default function StyleSelection() {
  const router = useRouter();
  const { sourceImageUri, setSourceImageUri, generateBatch } =
    useImageContext();

  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    stylesList.map((s) => s.name),
  );
  const [customPrompt, setCustomPrompt] = useState("");
  const [removeBg, setRemoveBg] = useState(false);
  const [intensity, setIntensity] = useState(15);
  const [sliderWidth, setSliderWidth] = useState(0);

  const handleSliderTouch = (evt: any) => {
    const localX = evt.nativeEvent.locationX;
    if (sliderWidth > 0 && localX >= 0 && localX <= sliderWidth) {
      const percentage = (localX / sliderWidth) * 100;
      setIntensity(Math.round(percentage));
    }
  };

  const toggleStyle = (name: string) => {
    setSelectedStyles((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name],
    );
  };

  const handleChangeImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSourceImageUri(result.assets[0].uri);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImageUri) {
      Alert.alert("No Image", "Please upload or capture an image first.");
      return;
    }
    if (selectedStyles.length === 0) {
      Alert.alert("No Styles Selected", "Please select at least one style.");
      return;
    }

    generateBatch(selectedStyles, customPrompt, sourceImageUri, {
      removeBg,
      intensity,
    });
    router.replace("/(tabs)/gallery");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#7D48DF" />
          </Pressable>
          <Text style={styles.headerTitle}>Clipart Generator</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={16} color="#7D48DF" />
        </View>
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SOURCE IMAGE</Text>
          <Pressable
            style={styles.sourceImageContainer}
            onPress={handleChangeImage}
          >
            {sourceImageUri ? (
              <>
                <Image
                  source={{ uri: sourceImageUri }}
                  style={styles.sourceImage}
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.changeBadge}>
                    <Ionicons name="camera-reverse" size={16} color="#fff" />
                    <Text style={styles.changeBadgeText}>Change</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.uploadPrompt}>
                <Ionicons name="cloud-upload" size={32} color="#abadaf" />
                <Text style={styles.uploadPromptText}>Tap to select image</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.configContainer}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOpacity: 0.02,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View>
              <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>
                REMOVE BACKGROUND
              </Text>
              <Text
                style={{ fontSize: 13, color: "#abadaf", fontWeight: "500" }}
              >
                Generate transparent PNGs
              </Text>
            </View>
            <Switch
              value={removeBg}
              onValueChange={setRemoveBg}
              trackColor={{ false: "#d8dde9", true: "#7d48df" }}
            />
          </View>

          <View style={styles.sliderContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>
                STYLE INTENSITY
              </Text>
              <Text
                style={{ fontSize: 14, color: "#7d48df", fontWeight: "800" }}
              >
                {intensity}%
              </Text>
            </View>

            <View
              style={styles.sliderTouchArea}
              onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onResponderMove={handleSliderTouch}
              onResponderGrant={handleSliderTouch}
            >
              <View style={styles.sliderTrack} pointerEvents="none">
                <View
                  style={[styles.sliderFill, { width: `${intensity}%` }]}
                  pointerEvents="none"
                />
                <View
                  style={[
                    styles.sliderThumb,
                    { left: `${intensity}%`, marginLeft: -12 },
                  ]}
                  pointerEvents="none"
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <Text
                style={{ fontSize: 11, color: "#abadaf", fontWeight: "600" }}
              >
                Strict Likeness
              </Text>
              <Text
                style={{ fontSize: 11, color: "#abadaf", fontWeight: "600" }}
              >
                Creative Style
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>CUSTOM INSTRUCTIONS</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add specific details like 'soft pastel colors' or 'vibrant bold layouts'..."
            placeholderTextColor="#abadaf"
            value={customPrompt}
            onChangeText={setCustomPrompt}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.mainHeading}>Select Aesthetic</Text>
          <Text style={styles.subHeading}>
            Choose a visual direction for your clipart generation.
          </Text>

          <View style={styles.grid}>
            {stylesList.map((item) => {
              const isActive = selectedStyles.includes(item.name);
              return (
                <Pressable
                  key={item.name}
                  style={styles.card}
                  onPress={() => toggleStyle(item.name)}
                >
                  <View
                    style={[
                      styles.cardImageWrapper,
                      isActive && styles.cardImageWrapperActive,
                    ]}
                  >
                    <Image
                      source={{ uri: item.thumbnail }}
                      style={styles.cardImage}
                    />
                    {isActive && (
                      <View style={styles.activeCheck}>
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#fff"
                          style={{ fontWeight: "bold" }}
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.cardTitle,
                      isActive && styles.cardTitleActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.generateBtn,
              pressed && { transform: [{ scale: 0.98 }] },
              (!sourceImageUri || selectedStyles.length === 0) &&
                styles.generateBtnDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!sourceImageUri || selectedStyles.length === 0}
          >
            <Text style={styles.generateBtnText}>Generate Clipart</Text>
            <Ionicons name="color-wand" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.etaText}>
            Estimated generation time: ~12 seconds
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "#f3f4f5",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#191c1d" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#d8dde9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  divider: { height: 1, backgroundColor: "#f3f4f5", width: "100%" },
  container: { padding: 24, paddingBottom: 60 },
  section: { marginBottom: 32 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#5c616b",
    marginBottom: 16,
  },
  sourceImageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  sourceImage: { width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
  },
  changeBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  uploadPrompt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadPromptText: {
    fontSize: 14,
    color: "#abadaf",
    fontWeight: "bold",
    marginTop: 12,
  },
  configContainer: {
    backgroundColor: "#f3f4f5",
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  textArea: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    height: 120,
    fontSize: 14,
    color: "#191c1d",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sliderContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sliderTouchArea: {
    height: 32,
    justifyContent: "center",
  },
  sliderTrack: {
    height: 6,
    backgroundColor: "#e6e8eb",
    borderRadius: 3,
    width: "100%",
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 6,
    backgroundColor: "#7d48df",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    top: -9,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#7d48df",
    shadowColor: "#7d48df",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#191c1d",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subHeading: {
    fontSize: 16,
    color: "#5c616b",
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 20,
  },
  cardImageWrapper: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 12,
  },
  cardImageWrapperActive: {
    borderColor: "#6429c5",
    shadowColor: "#6429c5",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImage: { width: "100%", height: "100%" },
  activeCheck: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6429c5",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5c616b",
    paddingHorizontal: 4,
  },
  cardTitleActive: {
    color: "#191c1d",
  },
  footer: {
    marginTop: 16,
    alignItems: "center",
  },
  generateBtn: {
    width: "100%",
    backgroundColor: "#7d48df",
    paddingVertical: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#7d48df",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  generateBtnDisabled: {
    backgroundColor: "#abadaf",
    shadowOpacity: 0,
    elevation: 0,
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  etaText: {
    marginTop: 16,
    fontSize: 12,
    color: "#5c616b",
    fontWeight: "500",
  },
});
