/**
 * 通用语音播放工具 - 支持动态加载和多语言
 * 在浏览器环境中动态加载 Web Speech API
 */

export interface SpeechOptions {
  voice?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  lang?: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm';
}

export interface SpeechResult {
  success: boolean;
  error?: string;
  isPlaying: boolean;
  duration?: number;
}

class SpeechManager {
  private static instance: SpeechManager;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isLoading = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): SpeechManager {
    if (!SpeechManager.instance) {
      SpeechManager.instance = new SpeechManager();
    }
    return SpeechManager.instance;
  }

  /**
   * 动态初始化语音合成引擎
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      // 确保在浏览器环境中运行
      if (typeof window === 'undefined') {
        reject(
          new Error('Speech synthesis is only available in browser environment')
        );
        return;
      }

      // 检查 Web Speech API 支持
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis is not supported in this browser'));
        return;
      }

      this.synth = window.speechSynthesis;

      // 等待语音列表加载
      const loadVoices = () => {
        this.voices = this.synth!.getVoices();
        if (this.voices.length > 0) {
          this.isInitialized = true;
          resolve();
        } else {
          // 如果没有语音，等待一下再试
          setTimeout(() => {
            this.voices = this.synth!.getVoices();
            this.isInitialized = true;
            resolve();
          }, 100);
        }
      };

      // 监听语音列表加载事件
      this.synth.onvoiceschanged = loadVoices;

      // 立即尝试加载（有些浏览器不需要等待事件）
      loadVoices();
    });

    return this.initPromise;
  }

  /**
   * 获取可用的语音列表
   */
  async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    await this.initialize();
    return this.voices;
  }

  /**
   * 根据语言获取最佳语音
   */
  private getBestVoice(lang = 'en-US'): SpeechSynthesisVoice | null {
    // 精确匹配
    let voice = this.voices.find((v) => v.lang === lang);

    if (!voice) {
      // 尝试匹配语言前缀
      const langPrefix = lang.split('-')[0];
      voice = this.voices.find((v) => v.lang.startsWith(langPrefix));
    }

    if (!voice) {
      // 尝试英语语音
      voice = this.voices.find((v) => v.lang.startsWith('en'));
    }

    if (!voice && this.voices.length > 0) {
      // 使用默认语音
      voice = this.voices[0];
    }

    return voice || null;
  }

  /**
   * 应用情感参数到语音选项
   */
  private applyEmotion(options: SpeechOptions): SpeechOptions {
    const { emotion } = options;
    const adjustedOptions = { ...options };

    switch (emotion) {
      case 'happy':
        adjustedOptions.pitch = Math.min((options.pitch || 1) + 0.2, 2);
        adjustedOptions.rate = Math.min((options.rate || 1) + 0.1, 2);
        break;
      case 'sad':
        adjustedOptions.pitch = Math.max((options.pitch || 1) - 0.3, 0.1);
        adjustedOptions.rate = Math.max((options.rate || 1) - 0.2, 0.1);
        break;
      case 'excited':
        adjustedOptions.pitch = Math.min((options.pitch || 1) + 0.4, 2);
        adjustedOptions.rate = Math.min((options.rate || 1) + 0.3, 2);
        break;
      case 'calm':
        adjustedOptions.pitch = options.pitch || 1;
        adjustedOptions.rate = Math.max((options.rate || 1) - 0.1, 0.5);
        break;
      default:
        // neutral 保持默认参数
        break;
    }

    return adjustedOptions;
  }

  /**
   * 播放语音
   */
  async speak(
    text: string,
    options: SpeechOptions = {}
  ): Promise<SpeechResult> {
    try {
      // 停止当前播放
      this.stop();

      // 初始化语音引擎
      await this.initialize();

      if (!this.synth) {
        throw new Error('Speech synthesis not available');
      }

      // 清理文本
      const cleanText = text.trim();
      if (!cleanText) {
        return { success: false, error: 'Text is empty', isPlaying: false };
      }

      // 应用情感参数
      const adjustedOptions = this.applyEmotion(options);

      // 创建语音实例
      this.currentUtterance = new SpeechSynthesisUtterance(cleanText);

      // 设置语音参数
      const voice = this.getBestVoice(adjustedOptions.lang);
      if (voice) {
        this.currentUtterance.voice = voice;
      }

      this.currentUtterance.pitch = adjustedOptions.pitch || 1;
      this.currentUtterance.rate = adjustedOptions.rate || 1;
      this.currentUtterance.volume = adjustedOptions.volume || 1;
      this.currentUtterance.lang = adjustedOptions.lang || 'en-US';

      // 播放语音
      this.synth.speak(this.currentUtterance);

      return {
        success: true,
        isPlaying: true,
        duration: this.estimateDuration(cleanText, adjustedOptions.rate || 1),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isPlaying: false,
      };
    }
  }

  /**
   * 估算播放时长
   */
  private estimateDuration(text: string, rate = 1): number {
    // 平均每分钟阅读的单词数
    const wordsPerMinute = 150;
    const wordCount = text.split(/\s+/).length;
    const baseDuration = (wordCount / wordsPerMinute) * 60;
    return Math.ceil(baseDuration / rate);
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * 暂停播放
   */
  pause(): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  /**
   * 恢复播放
   */
  resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * 获取播放状态
   */
  getStatus(): {
    isPlaying: boolean;
    isPaused: boolean;
    isLoading: boolean;
  } {
    return {
      isPlaying: this.synth?.speaking || false,
      isPaused: this.synth?.paused || false,
      isLoading: this.isLoading,
    };
  }
}

// 导出单例实例
export const speechManager = SpeechManager.getInstance();

// 便捷函数：播放语音
export async function playSpeech(
  text: string,
  options: SpeechOptions = {}
): Promise<SpeechResult> {
  return await speechManager.speak(text, options);
}

// 便捷函数：停止语音
export function stopSpeech(): void {
  speechManager.stop();
}

// 便捷函数：暂停语音
export function pauseSpeech(): void {
  speechManager.pause();
}

// 便捷函数：恢复语音
export function resumeSpeech(): void {
  speechManager.resume();
}

// 便捷函数：获取语音状态
export function getSpeechStatus() {
  return speechManager.getStatus();
}

// 便捷函数：获取可用语音列表
export async function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return await speechManager.getAvailableVoices();
}
