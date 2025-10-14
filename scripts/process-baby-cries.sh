#!/bin/bash

# Process Baby Cry Audio Files
# Converts downloaded files to optimized MP3 format

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

DOWNLOAD_DIR="public/audio/baby-cries/downloads"
OUTPUT_DIR="public/audio/baby-cries"

echo -e "${GREEN}🎵 Baby Cry Audio Processor${NC}"
echo "========================================"
echo ""

# Create directories if they don't exist
mkdir -p "$DOWNLOAD_DIR"
mkdir -p "$OUTPUT_DIR"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ Error: ffmpeg is not installed${NC}"
    echo "Please install ffmpeg:"
    echo "  brew install ffmpeg"
    exit 1
fi

# Define target filenames
declare -A TARGET_FILES=(
    ["hungry-cry"]="hungry-cry.mp3"
    ["tired-cry"]="tired-cry.mp3"
    ["discomfort-cry"]="discomfort-cry.mp3"
    ["pain-cry"]="pain-cry.mp3"
    ["attention-cry"]="attention-cry.mp3"
    ["sleepy-cry"]="sleepy-cry.mp3"
)

# Process files
PROCESSED=0
SKIPPED=0
FAILED=0

for KEY in "${!TARGET_FILES[@]}"; do
    TARGET_FILE="${TARGET_FILES[$KEY]}"
    OUTPUT_PATH="$OUTPUT_DIR/$TARGET_FILE"

    echo -e "Processing: ${YELLOW}$TARGET_FILE${NC}"

    # Find source file in downloads directory
    SOURCE_FILE=""

    # Try different extensions
    for EXT in mp3 wav m4a ogg webm flac; do
        # Try exact match first
        if [ -f "$DOWNLOAD_DIR/${KEY}.$EXT" ]; then
            SOURCE_FILE="$DOWNLOAD_DIR/${KEY}.$EXT"
            break
        fi

        # Try with wildcard matching
        FOUND=$(find "$DOWNLOAD_DIR" -type f -iname "*${KEY}*.$EXT" -print -quit 2>/dev/null || echo "")
        if [ -n "$FOUND" ]; then
            SOURCE_FILE="$FOUND"
            break
        fi
    done

    # If not found in downloads, try finding in current audio directory
    if [ -z "$SOURCE_FILE" ]; then
        for EXT in mp3 wav m4a ogg webm; do
            if [ -f "$OUTPUT_DIR/${KEY}.$EXT" ]; then
                SOURCE_FILE="$OUTPUT_DIR/${KEY}.$EXT"
                break
            fi
        done
    fi

    if [ -z "$SOURCE_FILE" ]; then
        echo -e "  ${YELLOW}⚠️  Source file not found, skipping${NC}"
        ((SKIPPED++))
        echo ""
        continue
    fi

    echo "  📁 Source: $SOURCE_FILE"

    # Convert to MP3 with optimizations
    if ffmpeg -i "$SOURCE_FILE" \
              -ac 1 \
              -ar 44100 \
              -b:a 64k \
              -t 5 \
              -y \
              "$OUTPUT_PATH" \
              -loglevel error 2>&1; then

        # Check file size
        if [ -f "$OUTPUT_PATH" ]; then
            FILE_SIZE=$(stat -f%z "$OUTPUT_PATH" 2>/dev/null || stat -c%s "$OUTPUT_PATH" 2>/dev/null)
            FILE_SIZE_KB=$((FILE_SIZE / 1024))

            if [ $FILE_SIZE_KB -gt 100 ]; then
                echo -e "  ${YELLOW}⚠️  File size (${FILE_SIZE_KB}KB) exceeds 100KB, recompressing...${NC}"

                # Recompress with lower bitrate
                ffmpeg -i "$SOURCE_FILE" \
                      -ac 1 \
                      -ar 44100 \
                      -b:a 48k \
                      -t 4 \
                      -y \
                      "$OUTPUT_PATH" \
                      -loglevel error

                FILE_SIZE=$(stat -f%z "$OUTPUT_PATH" 2>/dev/null || stat -c%s "$OUTPUT_PATH" 2>/dev/null)
                FILE_SIZE_KB=$((FILE_SIZE / 1024))
            fi

            echo -e "  ${GREEN}✓ Created $TARGET_FILE (${FILE_SIZE_KB}KB)${NC}"
            ((PROCESSED++))
        else
            echo -e "  ${RED}❌ Failed to create output file${NC}"
            ((FAILED++))
        fi
    else
        echo -e "  ${RED}❌ FFmpeg conversion failed${NC}"
        ((FAILED++))
    fi

    echo ""
done

echo "========================================"
echo -e "${GREEN}Summary:${NC}"
echo "  ✓ Processed: $PROCESSED files"
echo "  ⚠ Skipped:   $SKIPPED files"
echo "  ❌ Failed:    $FAILED files"
echo "========================================"
echo ""

# List final files
if [ $PROCESSED -gt 0 ]; then
    echo "📂 Output files:"
    ls -lh "$OUTPUT_DIR"/*.mp3 2>/dev/null | awk '{printf "  %s (%s)\n", $9, $5}' || echo "  No files found"
    echo ""
fi

# Show next steps if files are missing
TOTAL_FILES=6
EXISTING_FILES=$(ls "$OUTPUT_DIR"/*.mp3 2>/dev/null | wc -l | tr -d ' ')

if [ $EXISTING_FILES -lt $TOTAL_FILES ]; then
    echo -e "${YELLOW}⚠️  Still need $((TOTAL_FILES - EXISTING_FILES)) more audio files${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Visit: scripts/DOWNLOAD-BABY-CRIES-GUIDE.md"
    echo "2. Download missing audio files to: $DOWNLOAD_DIR"
    echo "3. Run this script again: ./scripts/process-baby-cries.sh"
    echo ""
fi

echo -e "${GREEN}✅ Done!${NC}"
