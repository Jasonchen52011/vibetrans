/**
 * 语音播放 React Hook - 动态加载语音功能
 * 提供简单的API用于在任何组件中使用语音播放
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpeechOptions, SpeechResult } from '@/lib/speech/speech-manager';

interface UseSpeechOptions {
  autoStart?: boolean;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface SpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
  duration?: number;
  progress: number; // 播放进度 0-100
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [state, setState] = useState<SpeechState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    error: null,
    progress: 0
  });

  const speechManagerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // 动态加载语音管理器
  const loadSpeechManager = useCallback(async () => {
    if (speechManagerRef.current) return speechManagerRef.current;

    try {
      // 动态导入语音管理器
      const { speechManager } = await import('@/lib/speech/speech-manager');
      speechManagerRef.current = speechManager;

      // 监听语音状态变化
      const updateStatus = () => {
        const status = speechManager.getStatus();
        setState(prev => ({
          ...prev,
          isPlaying: status.isPlaying,
          isPaused: status.isPaused,
          isLoading: status.isLoading
        }));
      };

      // 定期更新状态
      const statusInterval = setInterval(updateStatus, 100);

      // 清理函数
      return () => {
        clearInterval(statusInterval);
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load speech manager';
      setState(prev => ({ ...prev, error: errorMessage }));
      options.onError?.(errorMessage);
      return null;
    }
  }, [options.onError]);

  // 初始化语音功能
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const init = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      cleanup = await loadSpeechManager();
      setState(prev => ({ ...prev, isLoading: false }));
    };

    init();

    return () => {
      if (cleanup) cleanup();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [loadSpeechManager]);

  // 更新播放进度
  const startProgressTracking = useCallback((duration: number) => {
    startTimeRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / (duration * 1000)) * 100, 100);

      setState(prev => ({ ...prev, progress }));

      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, 100);
  }, []);

  // 停止进度跟踪
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setState(prev => ({ ...prev, progress: 0 }));
  }, []);

  // 播放语音
  const speak = useCallback(async (text: string, speechOptions?: SpeechOptions) => {
    if (!text.trim()) {
      const error = 'Text is empty';
      setState(prev => ({ ...prev, error }));
      options.onError?.(error);
      return { success: false, error, isPlaying: false };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const manager = await loadSpeechManager();
      if (!manager) {
        throw new Error('Speech manager not available');
      }

      options.onStart?.();

      const result: SpeechResult = await manager.speak(text, speechOptions);

      if (result.success) {
        setState(prev => ({
          ...prev,
          isPlaying: result.isPlaying,
          isLoading: false,
          error: null,
          duration: result.duration
        }));

        // 开始进度跟踪
        if (result.duration) {
          startProgressTracking(result.duration);
        }

        // 监听播放结束
        const checkEnd = setInterval(() => {
          const status = manager.getStatus();
          if (!status.isPlaying) {
            clearInterval(checkEnd);
            stopProgressTracking();
            setState(prev => ({
              ...prev,
              isPlaying: false,
              isPaused: false,
              progress: 0
            }));
            options.onEnd?.();
          }
        }, 100);

        return result;
      } else {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isLoading: false,
          error: result.error || 'Unknown error'
        }));
        options.onError?.(result.error || 'Unknown error');
        return result;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: errorMessage
      }));
      stopProgressTracking();
      options.onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage,
        isPlaying: false
      };
    }
  }, [loadSpeechManager, options, startProgressTracking, stopProgressTracking]);

  // 停止播放
  const stop = useCallback(() => {
    if (speechManagerRef.current) {
      speechManagerRef.current.stop();
    }
    stopProgressTracking();
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      progress: 0
    }));
  }, [stopProgressTracking]);

  // 暂停播放
  const pause = useCallback(() => {
    if (speechManagerRef.current) {
      speechManagerRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  // 恢复播放
  const resume = useCallback(() => {
    if (speechManagerRef.current) {
      speechManagerRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    stop();
    setState(prev => ({
      ...prev,
      error: null,
      duration: undefined,
      progress: 0
    }));
  }, [stop]);

  return {
    // 状态
    state,

    // 方法
    speak,
    stop,
    pause,
    resume,
    reset,

    // 便捷属性
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    isLoading: state.isLoading,
    error: state.error,
    duration: state.duration,
    progress: state.progress,

    // 检查是否支持语音功能
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window
  };
}