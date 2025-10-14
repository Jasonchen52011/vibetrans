#!/bin/bash

# 生成简单的婴儿哭声占位音频文件
# 使用 ffmpeg 生成简单的音频文件（如果可用）

echo "🎵 Generating placeholder baby cry audio files..."
echo "=================================================="

# 创建目录
mkdir -p public/audio/baby-cries
cd public/audio/baby-cries || exit

# 检查 ffmpeg 是否可用
if command -v ffmpeg &> /dev/null; then
    echo "✅ ffmpeg found, generating audio files..."

    # 生成不同频率的占位音频（模拟不同哭声）
    # Hungry cry - 较低频率，重复
    ffmpeg -f lavfi -i "sine=frequency=300:duration=3" -ac 1 -ar 22050 -b:a 64k hungry-cry.mp3 -y 2>/dev/null

    # Tired cry - 中频，断续
    ffmpeg -f lavfi -i "sine=frequency=400:duration=3" -ac 1 -ar 22050 -b:a 64k tired-cry.mp3 -y 2>/dev/null

    # Discomfort cry - 中高频
    ffmpeg -f lavfi -i "sine=frequency=500:duration=3" -ac 1 -ar 22050 -b:a 64k discomfort-cry.mp3 -y 2>/dev/null

    # Pain cry - 高频，急促
    ffmpeg -f lavfi -i "sine=frequency=600:duration=3" -ac 1 -ar 22050 -b:a 64k pain-cry.mp3 -y 2>/dev/null

    echo "✅ Audio files generated with ffmpeg"
else
    echo "⚠️  ffmpeg not found. Creating placeholder notice files..."
    echo "Please download actual baby cry audio samples manually." > PLACEHOLDER.txt
    echo ""
    echo "Recommended sources:"
    echo "1. Freesound.org - https://freesound.org/search/?q=baby+cry"
    echo "2. YouTube Audio Library"
    echo "3. AudioJungle (paid)"
fi

echo "=================================================="
echo "📁 Files in public/audio/baby-cries/:"
ls -lh

cd ../../..
