#!/bin/bash

# Bad Translator 截图转换脚本
# 使用方法: ./convert-to-webp.sh <input-image-path>

INPUT_IMAGE="$1"
OUTPUT_DIR="public/images/docs"
OUTPUT_FILE="$OUTPUT_DIR/what-is-bad-translator.webp"

# 检查输入文件
if [ ! -f "$INPUT_IMAGE" ]; then
    echo "错误: 找不到输入图片 $INPUT_IMAGE"
    echo "使用方法: ./convert-to-webp.sh <input-image-path>"
    exit 1
fi

# 确保输出目录存在
mkdir -p "$OUTPUT_DIR"

# 使用 sips (macOS 内置工具) 转换为 WebP
# 先调整质量以控制文件大小在 90KB 左右
echo "正在转换图片为 WebP 格式..."

# 尝试不同的质量设置以接近 90KB
for quality in 75 70 65 60 55 50; do
    # 转换为 WebP
    magick "$INPUT_IMAGE" -quality $quality -define webp:method=6 "$OUTPUT_FILE"

    # 检查文件大小
    file_size=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
    file_size_kb=$((file_size / 1024))

    echo "质量 $quality% - 文件大小: ${file_size_kb}KB"

    # 如果文件大小接近 90KB (85-95KB 范围内)，则停止
    if [ $file_size_kb -le 95 ] && [ $file_size_kb -ge 85 ]; then
        echo "✓ 转换完成！文件大小: ${file_size_kb}KB"
        echo "✓ 保存位置: $OUTPUT_FILE"
        exit 0
    fi

    # 如果文件已经小于 90KB，停止循环
    if [ $file_size_kb -lt 90 ]; then
        echo "✓ 转换完成！文件大小: ${file_size_kb}KB"
        echo "✓ 保存位置: $OUTPUT_FILE"
        exit 0
    fi
done

echo "✓ 转换完成！"
echo "✓ 保存位置: $OUTPUT_FILE"
