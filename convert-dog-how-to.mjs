import { statSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = 'public/images/docs/dog-translator-how-to.png';
const outputPath = 'public/images/docs/dog-translator-how-to.webp';

async function convertImage(inputPath, outputPath, targetSize = 90 * 1024) {
  try {
    console.log(`\nConverting: ${inputPath}`);

    // Try with original size first
    let quality = 80;
    let width = null;
    let output;
    let fileSize;

    do {
      const sharpInstance = sharp(join(__dirname, inputPath));

      if (width) {
        sharpInstance.resize({ width, withoutEnlargement: true });
      }

      output = await sharpInstance
        .webp({ quality, effort: 6 })
        .toFile(join(__dirname, outputPath));

      fileSize = statSync(join(__dirname, outputPath)).size;
      const fileSizeKB = (fileSize / 1024).toFixed(2);

      console.log(`  ${width ? `Width ${width}, ` : ''}Quality ${quality}: ${fileSizeKB} KB`);

      if (fileSize > targetSize) {
        if (quality > 50) {
          quality -= 10;
        } else if (!width) {
          width = 1920; // Start resizing
          quality = 80;
        } else if (width > 1280) {
          width -= 320;
          quality = 80;
        } else {
          break;
        }
      } else {
        break;
      }
    } while (fileSize > targetSize);

    const finalSizeKB = (fileSize / 1024).toFixed(2);
    console.log(`  ✅ Output: ${outputPath}`);
    console.log(`  Final size: ${finalSizeKB} KB | Dimensions: ${output.width}x${output.height}`);

    // Delete original PNG
    console.log(`\nDeleting original PNG file...`);
    unlinkSync(join(__dirname, inputPath));
    console.log(`✅ Deleted: ${inputPath}`);

    return true;
  } catch (error) {
    console.error(`  ❌ Error converting ${inputPath}:`, error.message);
    return false;
  }
}

convertImage(inputPath, outputPath);
