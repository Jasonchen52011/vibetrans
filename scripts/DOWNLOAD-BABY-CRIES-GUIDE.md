# 🎵 婴儿哭声音频下载指南

## 已找到的 CC0 音频文件

我已经在 Freesound.org 上找到了 6 个高质量的 CC0 许可婴儿哭声音频:

### 下载链接

1. **hungry-cry.mp3** - Crying baby 2
   - 链接: https://freesound.org/people/MBPL/sounds/668793/
   - 下载数: 827
   - 许可: CC0 (公共领域)

2. **tired-cry.mp3** - Crying newborn baby child 1.WAV
   - 链接: https://freesound.org/people/the_yura/sounds/211529/
   - 下载数: 2.1K
   - 许可: CC0 (公共领域)

3. **discomfort-cry.mp3** - baby girl crying
   - 链接: https://freesound.org/people/josephvm/sounds/442655/
   - 下载数: 5.3K
   - 许可: CC0 (公共领域)

4. **pain-cry.mp3** - baby cry short
   - 链接: https://freesound.org/people/aniovino/sounds/571420/
   - 下载数: 335
   - 许可: CC0 (公共领域)

5. **attention-cry.mp3** - babys crying.mp3
   - 链接: https://freesound.org/people/winsx87/sounds/152007/
   - 下载数: 7.2K
   - 许可: CC0 (公共领域)

6. **sleepy-cry.mp3** - Baby crying (1 month)
   - 链接: https://freesound.org/people/Xekilor/sounds/773911/
   - 下载数: 205
   - 许可: CC0 (公共领域)

## 📥 下载步骤

### 方法 1: 手动下载(推荐)

1. **注册 Freesound.org 账号**
   - 访问 https://freesound.org/home/register/
   - 免费注册账号(只需邮箱)

2. **下载每个音频文件**
   - 点击上面的链接
   - 点击页面上的 "Download" 按钮
   - 保存到 `/Users/jason-chen/Downloads/project/vibetrans/public/audio/baby-cries/downloads/` 文件夹

3. **运行处理脚本**
   ```bash
   cd /Users/jason-chen/Downloads/project/vibetrans
   ./scripts/process-baby-cries.sh
   ```

### 方法 2: 使用现有的占位音频

如果你想快速测试,可以使用已经存在的 4 个 m4a 文件:
- hungry-cry.m4a
- tired-cry.m4a
- discomfort-cry.m4a
- pain-cry.m4a

只需要再下载 2 个:
- attention-cry.mp3 (sound ID: 152007)
- sleepy-cry.mp3 (sound ID: 773911)

## 🔧 自动处理脚本

下载完成后,运行处理脚本会自动:
- ✅ 转换为 MP3 格式
- ✅ 统一采样率(44.1kHz)
- ✅ 压缩到 < 100KB
- ✅ 裁剪到 3-5 秒
- ✅ 重命名为正确的文件名

## ⚠️ 许可说明

所有音频文件均为 CC0 许可:
- ✅ 可商业使用
- ✅ 无需署名
- ✅ 可修改和分发
- ✅ 公共领域,完全免费

## 📝 使用记录

下载后请在 `/public/audio/baby-cries/CREDITS.md` 中记录音频来源,虽然 CC0 不要求,但这是良好的实践。
