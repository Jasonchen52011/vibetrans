import { statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, 'public/images/docs/vibetranshome.png');
const outputPath = join(__dirname, 'public/images/docs/vibetranshome.webp');

async function convertImage() {
  try {
    console.log('Converting image to WebP format...');
    console.log('Input:', inputPath);

    // Try different quality settings to get under 90KB
    let quality = 85;
    let output;
    let fileSize;

    do {
      output = await sharp(inputPath)
        .webp({ quality, effort: 6 })
        .toFile(outputPath);

      fileSize = statSync(outputPath).size;
      const fileSizeKB = (fileSize / 1024).toFixed(2);

      console.log(`Quality ${quality}: ${fileSizeKB} KB`);

      if (fileSize > 90 * 1024 && quality > 50) {
        quality -= 5;
      } else {
        break;
      }
    } while (fileSize > 90 * 1024 && quality > 50);

    const finalSizeKB = (fileSize / 1024).toFixed(2);
    console.log('\n✅ Conversion complete!');
    console.log(`Output: ${outputPath}`);
    console.log(`Final size: ${finalSizeKB} KB`);
    console.log(`Dimensions: ${output.width}x${output.height}`);
    console.log(`Quality: ${quality}`);
  } catch (error) {
    console.error('Error converting image:', error);
    process.exit(1);
  }
}

convertImage();
