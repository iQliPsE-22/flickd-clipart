import React, { createContext, useContext, useState, type ReactNode } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { generateClipart } from '@/services/leonardo';

export interface GeneratedImage {
  uri: string;
  title: string;
  style: string;
  timestamp: number;
}

interface ImageContextType {
  sourceImageUri: string | null;
  setSourceImageUri: (uri: string | null) => void;
  sourceImageBase64: string | null;
  setSourceImageBase64: (b64: string | null) => void;
  generatedImages: GeneratedImage[];
  setGeneratedImages: (images: GeneratedImage[]) => void;
  selectedImage: GeneratedImage | null;
  setSelectedImage: (image: GeneratedImage | null) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  progress: number;
  setProgress: (val: number) => void;
  activePrompt: string;
  setActivePrompt: (p: string) => void;
  expectedStylesCount: number;
  setExpectedStylesCount: (val: number) => void;
  generateBatch: (styles: string[], prompt: string, sourceUri: string, options?: { removeBg?: boolean; intensity?: number }) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [sourceImageUri, setSourceImageUri] = useState<string | null>(null);
  const [sourceImageBase64, setSourceImageBase64] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activePrompt, setActivePrompt] = useState('');
  const [expectedStylesCount, setExpectedStylesCount] = useState(4);
  const [lastGenerationTime, setLastGenerationTime] = useState<number>(0);

  const RATE_LIMIT_COOLDOWN_MS = 15000;

  const generateBatch = async (styles: string[], prompt: string, sourceUri: string, options?: { removeBg?: boolean; intensity?: number }) => {
    const now = Date.now();
    if (now - lastGenerationTime < RATE_LIMIT_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_COOLDOWN_MS - (now - lastGenerationTime)) / 1000);
      Alert.alert('Rate Limited', `Please wait ${remainingSeconds} seconds before generating again to prevent abuse.`);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setActivePrompt(prompt || 'a beautiful illustration');
    setExpectedStylesCount(styles.length);
    setLastGenerationTime(now);
    
    try {
      let imageBase64 = sourceImageBase64;
      if (!imageBase64) {
        try {
          imageBase64 = await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 });
        } catch (err) {
          Alert.alert('Error', 'Could not read the selected image.');
          setIsGenerating(false);
          return;
        }
      }

      const allResults: GeneratedImage[] = [];
      const promises = styles.map(async (style) => {
        try {
          const uri = await generateClipart(style, prompt || undefined, imageBase64, { 
            transparent: options?.removeBg, 
            intensity: options?.intensity 
          });
          const img: GeneratedImage = { uri, title: style, style, timestamp: Date.now() };
          allResults.push(img);
        } catch (error) {
          console.warn(`Failed to generate ${style}:`, error);
        }
      });

      await Promise.all(promises);
      
      setGeneratedImages(prev => {
         return [...allResults, ...prev];
      });
      setProgress(100);
    } catch (error) {
      Alert.alert('Generation Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ImageContext.Provider
      value={{
        sourceImageUri,
        setSourceImageUri,
        sourceImageBase64,
        setSourceImageBase64,
        generatedImages,
        setGeneratedImages,
        selectedImage,
        setSelectedImage,
        isGenerating,
        setIsGenerating,
        progress,
        setProgress,
        activePrompt,
        setActivePrompt,
        expectedStylesCount,
        setExpectedStylesCount,
        generateBatch,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}

export function useImageContext() {
  const ctx = useContext(ImageContext);
  if (!ctx) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return ctx;
}
