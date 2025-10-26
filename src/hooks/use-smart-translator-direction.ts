import { useCallback, useMemo, useState } from 'react';

type NullableConfidence = number | undefined | null;

export interface SmartTranslatorDirectionOptions<Direction extends string> {
  apiPath: string;
  defaultDirection: Direction;
  /**
   * Ordered list of valid directions. When toggle() is called the hook cycles through this array.
   * Provide at least two directions when manual toggling should be enabled.
   */
  directions: Direction[];
  /**
   * Locale string used for default warning messages (optional).
   */
  locale?: string;
  /**
   * Supported language keys reported by the API. When the detected language is not in this list
   * and the confidence is low, a warning will be surfaced.
   */
  supportedLanguages?: string[];
  /**
   * Optional custom warning text, otherwise a locale-aware default is used.
   */
  warningMessage?: string;
  /**
   * Allows customising the detect-only request body. By default we send
   * { text, detectOnly: true }.
   */
  buildDetectPayload?: (text: string) => Record<string, unknown>;
}

export interface SmartTranslatorDetectionSummary<Direction extends string> {
  detectedDirection: Direction;
  detectedInputLanguage: string;
  confidence: number;
}

export interface SmartTranslatorDirectionState<Direction extends string> {
  activeDirection: Direction;
  /**
   * Returns true when the user manually selected a direction. While in manual mode we do not
   * override `activeDirection` with auto-detected results.
   */
  isManualDirection: boolean;
  detectedLanguage: string;
  languageWarning: string;
  /**
   * Executes a detect-only call against the API and updates local state. Returns the summary
   * so callers can respond to the result (e.g., to decide whether to proceed with translation).
   */
  runLanguageDetection: (
    text: string
  ) => Promise<SmartTranslatorDetectionSummary<Direction>>;
  /**
   * Cycles to the next configured direction and enables manual mode.
   */
  toggleDirection: () => void;
  /**
   * Sets manual mode and updates the direction explicitly.
   */
  setManualDirection: (direction: Direction) => void;
  /**
   * Updates the direction without entering manual mode. Useful for syncing with server-side
   * corrections while keeping auto-detection enabled.
   */
  setAutoDirection: (direction: Direction) => void;
  /**
   * Resets to the default direction and clears manual mode / warnings.
   */
  resetDirection: () => void;
  /**
   * Clear any warning message that might be shown to the user.
   */
  clearWarning: () => void;
}

function getDefaultWarning(locale?: string) {
  if (locale?.toLowerCase().startsWith('zh')) {
    return '请输入受支持的语言内容';
  }
  return 'Please input text in the supported languages.';
}

function normaliseConfidence(confidence: NullableConfidence) {
  if (typeof confidence === 'number' && !Number.isNaN(confidence)) {
    return Math.max(0, Math.min(1, confidence));
  }
  return 0;
}

export function useSmartTranslatorDirection<Direction extends string>({
  apiPath,
  defaultDirection,
  directions,
  locale,
  supportedLanguages,
  warningMessage,
  buildDetectPayload,
}: SmartTranslatorDirectionOptions<Direction>): SmartTranslatorDirectionState<Direction> {
  if (!directions.includes(defaultDirection)) {
    throw new Error(
      `defaultDirection "${defaultDirection}" must be included in the directions array`
    );
  }

  const [activeDirection, setActiveDirection] =
    useState<Direction>(defaultDirection);
  const [isManualDirection, setIsManualDirection] = useState<boolean>(false);
  const [detectedLanguage, setDetectedLanguage] =
    useState<string>('unknown');
  const [languageWarning, setLanguageWarning] = useState<string>('');

  const fallbackWarning = useMemo(
    () => warningMessage || getDefaultWarning(locale),
    [locale, warningMessage]
  );

  const isSupportedLanguage = useCallback(
    (language: string | undefined | null) => {
      if (!language || language === 'unknown') {
        return false;
      }
      if (!supportedLanguages || supportedLanguages.length === 0) {
        return true;
      }
      return supportedLanguages.includes(language);
    },
    [supportedLanguages]
  );

  const buildPayload = useCallback(
    (text: string) => {
      if (buildDetectPayload) {
        return buildDetectPayload(text);
      }
      return {
        text,
        detectOnly: true,
      };
    },
    [buildDetectPayload]
  );

  const runLanguageDetection = useCallback(
    async (
      text: string
    ): Promise<SmartTranslatorDetectionSummary<Direction>> => {
      const trimmed = text.trim();
      if (!trimmed) {
        if (!isManualDirection) {
          setActiveDirection(defaultDirection);
        }
        setIsManualDirection(false);
        setDetectedLanguage('unknown');
        setLanguageWarning('');
        return {
          detectedDirection: (isManualDirection
            ? activeDirection
            : defaultDirection) as Direction,
          detectedInputLanguage: 'unknown',
          confidence: 0,
        };
      }

      try {
        const response = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(trimmed)),
        });

        if (!response.ok) {
          throw new Error('Language detection failed');
        }

        const data = await response.json();
        const confidence = normaliseConfidence(data.confidence);
        const detectedInputLanguage =
          data.detectedInputLanguage || 'unknown';
        const detectedDirectionRaw = data.detectedDirection as Direction | undefined;
        const nextDirection = detectedDirectionRaw && directions.includes(detectedDirectionRaw)
          ? detectedDirectionRaw
          : defaultDirection;

        if (!isManualDirection) {
          setActiveDirection(nextDirection);
        }

        setDetectedLanguage(detectedInputLanguage);

        if (!isSupportedLanguage(detectedInputLanguage) && confidence < 0.3) {
          setLanguageWarning(fallbackWarning);
        } else {
          setLanguageWarning('');
        }

        return {
          detectedDirection: (isManualDirection
            ? activeDirection
            : nextDirection) as Direction,
          detectedInputLanguage,
          confidence,
        };
      } catch (error) {
        console.warn('Language detection failed:', error);
        if (!isManualDirection) {
          setLanguageWarning(fallbackWarning);
        }
        return {
          detectedDirection: (isManualDirection
            ? activeDirection
            : defaultDirection) as Direction,
          detectedInputLanguage: 'unknown',
          confidence: 0,
        };
      }
    },
    [
      apiPath,
      isManualDirection,
      defaultDirection,
      activeDirection,
      directions,
      buildPayload,
      isSupportedLanguage,
      fallbackWarning,
    ]
  );

  const toggleDirection = useCallback(() => {
    if (directions.length === 0) return;
    const currentIndex = directions.indexOf(activeDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    setActiveDirection(directions[nextIndex]);
    setIsManualDirection(true);
    setLanguageWarning('');
  }, [activeDirection, directions]);

  const setManualDirection = useCallback(
    (direction: Direction) => {
      if (!directions.includes(direction)) {
        console.warn(`Attempted to set unsupported direction "${direction}"`);
        return;
      }
      setActiveDirection(direction);
      setIsManualDirection(true);
      setLanguageWarning('');
    },
    [directions]
  );

  const setAutoDirection = useCallback(
    (direction: Direction) => {
      if (!directions.includes(direction)) {
        console.warn(`Attempted to set unsupported direction "${direction}"`);
        return;
      }
      setActiveDirection(direction);
    },
    [directions]
  );

  const resetDirection = useCallback(() => {
    setActiveDirection(defaultDirection);
    setIsManualDirection(false);
    setDetectedLanguage('unknown');
    setLanguageWarning('');
  }, [defaultDirection]);

  const clearWarning = useCallback(() => {
    setLanguageWarning('');
  }, []);

  return {
    activeDirection,
    isManualDirection,
    detectedLanguage,
    languageWarning,
    runLanguageDetection,
    toggleDirection,
    setManualDirection,
    setAutoDirection,
    resetDirection,
    clearWarning,
  };
}
