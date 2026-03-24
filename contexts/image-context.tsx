import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
