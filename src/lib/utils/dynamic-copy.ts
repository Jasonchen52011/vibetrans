/**
 * 动态加载的复制功能
 * 只有在用户点击时才加载，减少初始JavaScript包大小
 */

interface CopyOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 动态复制文本到剪贴板
 * @param text 要复制的文本
 * @param options 配置选项
 */
export async function dynamicCopyToClipboard(
  text: string,
  options: CopyOptions = {}
): Promise<boolean> {
  const {
    successMessage = 'Text copied to clipboard!',
    errorMessage = 'Failed to copy text',
    onSuccess,
    onError
  } = options;

  try {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      throw new Error('Clipboard API is only available in browser environment');
    }

    // 检查Clipboard API是否可用
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported in this browser');
    }

    // 执行复制
    await navigator.clipboard.writeText(text);

    // 成功回调
    onSuccess?.();

    // 可选：显示成功提示（如果需要）
    if (successMessage) {
      console.log(successMessage);
    }

    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    // 错误回调
    onError?.(err);

    console.error('Copy failed:', err);

    return false;
  }
}

/**
 * 降级复制方案（适用于不支持Clipboard API的环境）
 * @param text 要复制的文本
 */
export function fallbackCopyToClipboard(text: string): boolean {
  try {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      return false;
    }

    // 创建临时文本区域
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);

    // 选择并复制
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');

    // 清理
    document.body.removeChild(textArea);

    return successful;
  } catch (error) {
    console.error('Fallback copy failed:', error);
    return false;
  }
}

/**
 * 智能复制函数（优先使用Clipboard API，降级到传统方法）
 * @param text 要复制的文本
 * @param options 配置选项
 */
export async function smartCopyToClipboard(
  text: string,
  options: CopyOptions = {}
): Promise<boolean> {
  try {
    // 首先尝试现代API
    return await dynamicCopyToClipboard(text, options);
  } catch (error) {
    console.warn('Modern clipboard API failed, trying fallback:', error);

    // 降级到传统方法
    const success = fallbackCopyToClipboard(text);

    if (success) {
      options.onSuccess?.();
    } else {
      options.onError?.(error instanceof Error ? error : new Error('All copy methods failed'));
    }

    return success;
  }
}