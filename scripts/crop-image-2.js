const sharp = require('sharp');
const path = require('path');

async function cropImage() {
  const imagePath = path.join(__dirname, '../public/images/docs/translation-tool-plus.webp');
  
  // 当前尺寸 760x580
  // 裁剪：下方30px
  // 新尺寸：760x550
  
  await sharp(imagePath)
    .extract({
      left: 0,
      top: 0,
      width: 760,
      height: 550
    })
    .toFile(path.join(__dirname, '../public/images/docs/translation-tool-plus-cropped2.webp'));
  
  console.log('✅ 图片裁剪完成');
  console.log('原尺寸: 760x580');
  console.log('新尺寸: 760x550 (下方减30px)');
}

cropImage().catch(console.error);
