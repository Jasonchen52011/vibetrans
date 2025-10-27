#!/usr/bin/env python3
"""
Process Zalgo Text Origin and Unicode Magic images:
1. Crop top 350 pixels (remove watermark)
2. Crop to 4:3 aspect ratio
3. Convert to WebP ~90KB
"""

from PIL import Image
import os

# Define source and target files
images_to_process = [
    {
        'source': 'public/images/docs/jimeng-2025-10-10-7622-、_A whimsical, geometric flat style cart....png',
        'target': 'public/images/docs/zalgo-text-origin.webp',
        'title': 'Zalgo Text Origin'
    },
    {
        'source': 'public/images/docs/jimeng-2025-10-10-5763-Prompt_ _A playful, geometric flat style....png',
        'target': 'public/images/docs/unicode-magic.webp',
        'title': 'Unicode Magic'
    }
]

def process_image(source_path, target_path, title):
    """Process a single image with cropping and WebP conversion"""
    print(f"\n{'='*70}")
    print(f"🎨 Processing: {title}")
    print(f"{'='*70}")

    # Open image
    print(f"📂 Opening: {source_path}")
    img = Image.open(source_path)
    original_size = img.size
    print(f"   Original size: {original_size[0]}x{original_size[1]}")

    # Step 1: Crop top 350 pixels (remove watermark)
    print(f"\n✂️  Step 1: Cropping top 350 pixels (remove watermark)")
    width, height = img.size
    img_cropped = img.crop((0, 350, width, height))
    cropped_size = img_cropped.size
    print(f"   After watermark removal: {cropped_size[0]}x{cropped_size[1]}")

    # Step 2: Crop to 4:3 aspect ratio
    print(f"\n✂️  Step 2: Cropping to 4:3 aspect ratio")
    width, height = img_cropped.size
    target_ratio = 4 / 3
    current_ratio = width / height

    if current_ratio > target_ratio:
        # Image is too wide, crop width
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        img_final = img_cropped.crop((left, 0, left + new_width, height))
        print(f"   Cropped width from {width} to {new_width} (centered)")
    else:
        # Image is too tall, crop height
        new_height = int(width / target_ratio)
        top = (height - new_height) // 2
        img_final = img_cropped.crop((0, top, width, top + new_height))
        print(f"   Cropped height from {height} to {new_height} (centered)")

    final_size = img_final.size
    print(f"   Final size: {final_size[0]}x{final_size[1]} (ratio: {final_size[0]/final_size[1]:.2f})")

    # Step 3: Resize to standard dimensions (800x600 for 4:3 ratio)
    print(f"\n📐 Step 3: Resizing to 800x600")
    img_resized = img_final.resize((800, 600), Image.Resampling.LANCZOS)

    # Step 4: Convert to WebP with quality tuning to achieve ~90KB
    print(f"\n💾 Step 4: Converting to WebP (target: ~90KB)")

    # Try different quality levels to hit ~90KB target
    quality_levels = [85, 90, 92, 95, 98, 99]
    best_quality = 85
    best_size = 0

    for quality in quality_levels:
        # Save to temporary file to check size
        temp_path = target_path + '.temp'
        img_resized.save(temp_path, 'WEBP', quality=quality)
        file_size = os.path.getsize(temp_path)
        file_size_kb = file_size / 1024
        print(f"   Quality {quality}: {file_size_kb:.1f}KB")

        # Check if this is closer to 90KB
        if abs(file_size_kb - 90) < abs(best_size - 90):
            best_quality = quality
            best_size = file_size_kb

        # If we're above 90KB and this quality is higher, stop
        if file_size_kb > 95 and quality > best_quality:
            os.remove(temp_path)
            break

        os.remove(temp_path)

    # Save final image with best quality
    img_resized.save(target_path, 'WEBP', quality=best_quality)
    final_file_size = os.path.getsize(target_path) / 1024

    print(f"\n✅ Saved: {target_path}")
    print(f"   Quality: {best_quality}")
    print(f"   Size: {final_file_size:.1f}KB")
    print(f"   Dimensions: 800x600 (4:3)")

    return True

# Main processing
print("🚀 Starting image processing for Zalgo Text Origin and Unicode Magic\n")

success_count = 0
for img_config in images_to_process:
    try:
        if process_image(img_config['source'], img_config['target'], img_config['title']):
            success_count += 1
    except Exception as e:
        print(f"\n❌ Error processing {img_config['title']}: {str(e)}")

print(f"\n{'='*70}")
print(f"✅ Processing complete: {success_count}/{len(images_to_process)} images processed successfully")
print(f"{'='*70}\n")
