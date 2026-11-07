import JSZip from 'jszip';
import { PHP_PROJECT_FILES } from './phpProjectFiles';

/**
 * Downloads the full turnkey Standalone PHP + Installer project
 * Contains install.php, index.php, admin/index.php, api/*.php, database.sql
 */
export async function downloadPhpFullProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root folder in the zip
  const root = zip.folder('LivexWin-PHP-Full-Project-with-Installer');

  for (const file of PHP_PROJECT_FILES) {
    root?.file(file.path, file.content);
  }

  // Generate blob
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  // Create download link
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LivexWin-PHP-Full-Project-with-Installer.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
