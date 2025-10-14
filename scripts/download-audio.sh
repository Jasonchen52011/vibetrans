#!/bin/bash

# 下载婴儿哭声音频文件
# 这些是来自 Freesound.org 的 CC0 公共域音频

echo "📥 Downloading baby cry audio samples from Freesound.org..."
echo "=================================================="

# 创建目录
mkdir -p public/audio/baby-cries

cd public/audio/baby-cries || exit

# 下载文件 (使用 curl 或 wget)
# 注意：这些是示例 URLs - 实际使用时需要替换为真实的下载链接

# Baby cry 1 - 用作 hungry cry
curl -L "https://cdn.freesound.org/previews/484/484344_10256840-lq.mp3" -o hungry-cry.mp3

# Baby cry 2 - 用作 tired cry
curl -L "https://cdn.freesound.org/previews/194/194931_3645617-lq.mp3" -o tired-cry.mp3

# Baby cry 3 - 用作 discomfort cry
curl -L "https://cdn.freesound.org/previews/194/194932_3645617-lq.mp3" -o discomfort-cry.mp3

# Baby cry 4 - 用作 pain cry
curl -L "https://cdn.freesound.org/previews/484/484345_10256840-lq.mp3" -o pain-cry.mp3

echo "=================================================="
echo "✅ Download complete!"
echo ""
echo "Files:"
ls -lh *.mp3

cd ../../..
