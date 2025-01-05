import { ElNotification } from "element-plus";
/**
 * 将 base64 字符串转换为 Blob 对象
 * @param {string} base64 - base64 字符串
 * @param {string} [mimeType=''] - Blob 对象的 MIME 类型
 * @returns {Blob}
 */
export const base64ToBlob = (base64, mimeType = '') => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};



/**
 * 下载图片
 * @param {string} src - 图片的 URL
 * @param {string} filename - 下载的文件名
 */
export const downloadImage = (src, filename) => {
  const link = document.createElement('a');
  link.href = src;
  link.download = filename;
  link.click();
};


/**
 * 将 File 对象的 size 属性转换为 KB
 * @param {File} file - File 对象
 * @returns {string} - 文件大小（KB）
 */
export const formatFileSize = (file) => {
  return (file.size / 1024).toFixed(2);
};

/**
 * Copies an image to the clipboard.
 *
 * @param {string} src - The base64 encoded string of the image to be copied.
 *
 * This function converts a base64 encoded image string to a Blob and writes it to the clipboard
 * as a 'image/png' ClipboardItem. It notifies the user of success or failure using ElNotification.
 */
export const copyImage = async (src) => {
  try {
    const clipboardItem = new ClipboardItem({
      'image/png': base64ToBlob(
        src.replace('data:image/png;base64,', ''),
        'image/png'
      ),
    });
    await navigator.clipboard.write([clipboardItem]);
    ElNotification({ type: 'success', message: '图片已复制到剪贴板' });
  } catch (error) {
    console.error('复制失败:', error);
    ElNotification({ type: 'error', message: '复制失败，请重试' });
  }
};
