const sharp = require('sharp');
const path = require('path');

async function cropImage() {
  const imagePath = path.join(
    __dirname,
    '../public/images/docs/translation-tool-plus.webp'
  );

  // 原图尺寸 800x600
  // 裁剪：左右各20px，下方20px
  // 新尺寸：760x580
  // 从 (20, 0) 开始，宽760，高580

  await sharp(imagePath)
    .extract({
      left: 20,
      top: 0,
      width: 760,
      height: 580,
    })
    .toFile(
      path.join(
        __dirname,
        '../public/images/docs/translation-tool-plus-cropped.webp'
      )
    );

  console.log('✅ 图片裁剪完成');
  console.log('原尺寸: 800x600');
  console.log('新尺寸: 760x580 (左右各减20px，下方减20px)');
}

cropImage().catch(console.error);
