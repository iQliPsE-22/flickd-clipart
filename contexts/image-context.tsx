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
  /** The URI of the image picked by the user */
  sourceImageUri: string | null;
  setSourceImageUri: (uri: string | null) => void;
  /** Base64-encoded source image for API calls */
  sourceImageBase64: string | null;
  setSourceImageBase64: (b64: string | null) => void;
  /** Generated clipart images from HuggingFace */
  generatedImages: GeneratedImage[];
  setGeneratedImages: (images: GeneratedImage[]) => void;
  /** Currently selected generated image for detail view */
  selectedImage: GeneratedImage | null;
  setSelectedImage: (image: GeneratedImage | null) => void;
  /** Whether generation is in progress */
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  /** Generation progress (0-100) */
  progress: number;
  setProgress: (val: number) => void;
  /** The prompt the user typed, persisted across screens */
  activePrompt: string;
  setActivePrompt: (p: string) => void;
  /** Number of styles requested in the latest batch */
  expectedStylesCount: number;
  setExpectedStylesCount: (val: number) => void;
  /** Trigger a batch generation that updates context states directly */
  generateBatch: (styles: string[], prompt: string, sourceUri: string) => Promise<void>;
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

  const generateBatch = async (styles: string[], prompt: string, sourceUri: string) => {
    setIsGenerating(true);
    setProgress(0);
    setActivePrompt(prompt || 'a beautiful illustration');
    setExpectedStylesCount(styles.length);
    
    try {
      let imageBase64;
      try {
        imageBase64 = await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 });
      } catch (err) {
        Alert.alert('Error', 'Could not read the selected image.');
        setIsGenerating(false);
        return;
      }

      const allResults: GeneratedImage[] = [];
      const promises = styles.map(async (style) => {
        try {
          const uri = await generateClipart(style, prompt || undefined, imageBase64);
          const img: GeneratedImage = { uri, title: style, style, timestamp: Date.now() };
          allResults.push(img);
        } catch (error) {
          console.warn(`Failed to generate ${style}:`, error);
        }
      });

      await Promise.all(promises);
      
      setGeneratedImages(prev => {
         // Keep only successful new ones, prepend them so they appear at top
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
