
"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateText, type TranslateTextInput } from '@/ai/flows/translate-text-flow';

interface TranslatableTextProps {
  children: string; // Original text in English (or the base language)
  as?: keyof JSX.IntrinsicElements; // Optional: render as p, span, h1 etc. Defaults to span.
  className?: string;
}

// Simple in-memory cache for translations
const translationCache = new Map<string, string>();

const TranslatableText: React.FC<TranslatableTextProps> = ({ children, as: Tag = 'span', className }) => {
  const { selectedLanguage } = useLanguage();
  const [displayText, setDisplayText] = useState<string>(children);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const originalText = children;

    if (!originalText) {
      setDisplayText('');
      return;
    }

    if (selectedLanguage.code.toLowerCase() === 'en') { // Assuming 'en' is the base language
      setDisplayText(originalText);
      setIsLoading(false);
      return;
    }

    const cacheKey = `${originalText}-${selectedLanguage.code.toLowerCase()}`;
    if (translationCache.has(cacheKey)) {
      setDisplayText(translationCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const performTranslation = async () => {
      if (!originalText.trim()) { // Don't translate empty or whitespace-only strings
          setDisplayText(originalText);
          setIsLoading(false);
          return;
      }
      setIsLoading(true);
      try {
        const input: TranslateTextInput = {
          textToTranslate: originalText,
          targetLanguageCode: selectedLanguage.code,
        };
        const result = await translateText(input); // This is an async server action call
        if (isMounted) {
          if (result.translatedText) {
            setDisplayText(result.translatedText);
            translationCache.set(cacheKey, result.translatedText);
          } else {
             // Fallback if translation is empty or fails silently
            setDisplayText(originalText);
          }
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
           // Fallback to original text on error
          setDisplayText(originalText);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    performTranslation();

    return () => {
      isMounted = false;
    };
  }, [children, selectedLanguage]);

  if (isLoading) {
    // You can return a loading indicator, like a shimmer or just ellipsis
    // For simplicity, we'll return the original text with an indicator, or just a subtle style
    return <Tag className={className} title={`Translating to ${selectedLanguage.name}...`}>{children}...</Tag>;
  }

  return <Tag className={className}>{displayText}</Tag>;
};

export default TranslatableText;
