import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { PHP_PROJECT_FILES } from '../src/services/phpProjectFiles';

async function main() {
  console.log('Generating PHP Project ZIP archive...');
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Building LivexWin-PHP-Full-Project-with-Installer.zip...');
  const phpZip = new JSZip();
  const phpRoot = phpZip.folder('LivexWin-PHP-Full-Project-with-Installer');
  for (const f of PHP_PROJECT_FILES) {
    phpRoot?.file(f.path, f.content);
  }
  const phpBuffer = await phpZip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  fs.writeFileSync(path.join(publicDir, 'LivexWin-PHP-Full-Project-with-Installer.zip'), phpBuffer);
  console.log('Saved LivexWin-PHP-Full-Project-with-Installer.zip (', phpBuffer.length, 'bytes)');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
