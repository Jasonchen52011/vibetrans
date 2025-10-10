#!/bin/bash

# Bad Translator 截图转换脚本（使用 macOS sips）
# 使用方法: ./convert-screenshot.sh <input-image-path>

INPUT_IMAGE="$1"
OUTPUT_DIR="public/images/docs"
OUTPUT_FILE="$OUTPUT_DIR/bad-translator-how-to.webp"
TEMP_PNG="$OUTPUT_DIR/temp-bad-translator.png"

# 检查输入文件
if [ -z "$INPUT_IMAGE" ]; then
    echo "使用方法: ./convert-screenshot.sh <input-image-path>"
    echo "例如: ./convert-screenshot.sh ~/Desktop/screenshot.png"
    exit 1
fi

if [ ! -f "$INPUT_IMAGE" ]; then
    echo "错误: 找不到输入图片 $INPUT_IMAGE"
    exit 1
fi

# 确保输出目录存在
mkdir -p "$OUTPUT_DIR"

echo "正在转换图片..."

# 第一步：使用 sips 调整图片大小和质量
# 先转换为合适大小的 PNG
sips -s format png \
     -Z 1200 \
     "$INPUT_IMAGE" \
     --out "$TEMP_PNG"

# 检查是否安装了 cwebp（WebP 编码器）
if command -v cwebp &> /dev/null; then
    # 使用 cwebp 转换并压缩到接近 90KB
    echo "使用 cwebp 转换为 WebP..."

    # 尝试不同的质量设置
    for quality in 75 70 65 60 55 50; do
        cwebp -q $quality "$TEMP_PNG" -o "$OUTPUT_FILE"

        file_size=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null)
        file_size_kb=$((file_size / 1024))

        echo "质量 $quality% - 文件大小: ${file_size_kb}KB"

        if [ $file_size_kb -le 95 ] && [ $file_size_kb -ge 85 ]; then
            echo "✓ 已达到目标大小！"
            break
        fi

        if [ $file_size_kb -lt 90 ]; then
            break
        fi
    done

    rm "$TEMP_PNG"
    echo "✓ 转换完成！"
    echo "✓ 文件大小: ${file_size_kb}KB"
    echo "✓ 保存位置: $OUTPUT_FILE"
else
    echo "警告: 未找到 cwebp 工具"
    echo "请安装 webp: brew install webp"
    echo ""
    echo "临时方案: 使用 PNG 格式"

    # 优化 PNG
    sips -s format png \
         -Z 1200 \
         "$INPUT_IMAGE" \
         --out "${OUTPUT_FILE%.webp}.png"

    echo "✓ 已保存为 PNG 格式: ${OUTPUT_FILE%.webp}.png"
    echo "提示: 安装 webp 后再次运行此脚本转换为 WebP"
fi
