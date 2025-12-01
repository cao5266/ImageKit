// 下载辅助工具

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * 下载单个文件
 */
export function downloadFile(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}

/**
 * 批量下载（打包成 ZIP）
 */
export async function downloadAsZip(
  files: Array<{ blob: Blob; filename: string }>,
  zipName: string = 'images.zip'
): Promise<void> {
  const zip = new JSZip();
  
  files.forEach(({ blob, filename }) => {
    zip.file(filename, blob);
  });
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, zipName);
}
