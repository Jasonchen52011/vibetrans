/**
 * 动态加载的下载功能
 * 只有在用户点击时才加载，减少初始JavaScript包大小
 */

interface DownloadOptions {
  filename?: string;
  mimeType?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 动态下载文本内容为文件
 * @param content 要下载的文本内容
 * @param options 下载选项
 */
export function dynamicDownload(
  content: string,
  options: DownloadOptions = {}
): boolean {
  const {
    filename = `download-${Date.now()}.txt`,
    mimeType = 'text/plain',
    onSuccess,
    onError,
  } = options;

  try {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      throw new Error(
        'Download functionality is only available in browser environment'
      );
    }

    // 检查内容是否为空
    if (!content || content.trim() === '') {
      throw new Error('Content is empty, nothing to download');
    }

    // 创建Blob对象
    const blob = new Blob([content], { type: mimeType });

    // 创建下载链接
    const url = URL.createObjectURL(blob);

    // 创建临时链接元素
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    // 添加到DOM并触发点击
    document.body.appendChild(link);
    link.click();

    // 清理资源
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    // 成功回调
    onSuccess?.();

    console.log(`File "${filename}" downloaded successfully`);

    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    // 错误回调
    onError?.(err);

    console.error('Download failed:', err);

    return false;
  }
}

/**
 * 为特定工具生成下载文件名
 * @param toolName 工具名称
 * @param fileExtension 文件扩展名
 */
export function generateDownloadFilename(
  toolName: string,
  fileExtension = 'txt'
): string {
  // 清理工具名称，移除特殊字符和空格
  const cleanToolName = toolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${cleanToolName}-${Date.now()}.${fileExtension}`;
}

/**
 * 智能下载函数（带自动文件名生成）
 * @param content 要下载的内容
 * @param toolName 工具名称
 * @param options 额外选项
 */
export function smartDownload(
  content: string,
  toolName: string,
  options: Omit<DownloadOptions, 'filename'> = {}
): boolean {
  const filename = generateDownloadFilename(toolName);

  return dynamicDownload(content, {
    ...options,
    filename,
  });
}

/**
 * 批量下载功能
 * @param items 要下载的项目数组
 * @param toolName 工具名称
 */
export function batchDownload(
  items: Array<{ content: string; label?: string }>,
  toolName: string
): boolean {
  try {
    items.forEach((item, index) => {
      const label = item.label || `item-${index + 1}`;
      const filename = generateDownloadFilename(`${toolName}-${label}`);

      // 使用小延迟避免浏览器阻止多个下载
      setTimeout(() => {
        dynamicDownload(item.content, { filename });
      }, index * 100);
    });

    return true;
  } catch (error) {
    console.error('Batch download failed:', error);
    return false;
  }
}
