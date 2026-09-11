import { useCallback, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { getTTSCode } from '../data/translations';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(() =>
    typeof window !== 'undefined' && 'speechSynthesis' in window,
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const language = useStore((s) => s.language);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getTTSCode(language);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find a matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(
        (v) => v.lang === getTTSCode(language) || v.lang.startsWith(language),
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [language, isSupported],
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speakSteps = useCallback(
    (steps: { title: string; description: string }[]) => {
      const fullText = steps
        .map((s, i) => `Step ${i + 1}: ${s.title}. ${s.description}`)
        .join('. ');
      speak(fullText);
    },
    [speak],
  );

  return { speak, stop, isSpeaking, isSupported };
}
