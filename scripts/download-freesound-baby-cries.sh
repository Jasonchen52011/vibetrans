#!/bin/bash

# Download Baby Cry Audio Files from Freesound.org
# All files are CC0 (Public Domain) licensed

# Create temp directory
TEMP_DIR="/tmp/baby-cries-download"
OUTPUT_DIR="public/audio/baby-cries"

mkdir -p "$TEMP_DIR"
mkdir -p "$OUTPUT_DIR"

echo "Downloading 6 baby cry audio files from Freesound.org (CC0 license)..."

# Define the audio files to download
declare -A AUDIO_FILES=(
    ["668793"]="hungry-cry.mp3"
    ["211529"]="tired-cry.mp3"
    ["442655"]="discomfort-cry.mp3"
    ["571420"]="pain-cry.mp3"
    ["152007"]="attention-cry.mp3"
    ["773911"]="sleepy-cry.mp3"
)

# Download each file
for SOUND_ID in "${!AUDIO_FILES[@]}"; do
    FILENAME="${AUDIO_FILES[$SOUND_ID]}"
    echo "Downloading sound ID: $SOUND_ID -> $FILENAME"

    # Freesound.org direct download URL format
    # Note: You may need to register and get an API key for automated downloads
    # For now, we'll use curl to download the preview/download page

    curl -L "https://freesound.org/apiv2/sounds/$SOUND_ID/download/" \
         -o "$TEMP_DIR/${SOUND_ID}.wav" \
         --fail --silent --show-error || {
        echo "Failed to download $SOUND_ID, trying alternative method..."

        # Alternative: download preview (lower quality but works without auth)
        curl -L "https://freesound.org/data/previews/${SOUND_ID:0:3}/${SOUND_ID}-lq.mp3" \
             -o "$TEMP_DIR/${SOUND_ID}.mp3" \
             --fail --silent --show-error || {
            echo "⚠️  Could not download sound ID $SOUND_ID"
            continue
        }
    }
done

echo ""
echo "Converting and optimizing audio files..."

# Convert to MP3 and optimize size
for SOUND_ID in "${!AUDIO_FILES[@]}"; do
    FILENAME="${AUDIO_FILES[$SOUND_ID]}"
    INPUT_FILE="$TEMP_DIR/${SOUND_ID}.wav"
    OUTPUT_FILE="$OUTPUT_DIR/$FILENAME"

    # Check if WAV file exists, otherwise use MP3
    if [ ! -f "$INPUT_FILE" ]; then
        INPUT_FILE="$TEMP_DIR/${SOUND_ID}.mp3"
    fi

    if [ -f "$INPUT_FILE" ]; then
        echo "Processing: $FILENAME"

        # Convert to MP3 with specific settings to keep size < 100KB
        # - Mono audio
        # - 44.1kHz sample rate
        # - 64kbps bitrate
        # - Trim to 3-5 seconds
        ffmpeg -i "$INPUT_FILE" \
               -ac 1 \
               -ar 44100 \
               -b:a 64k \
               -t 5 \
               -y \
               "$OUTPUT_FILE" \
               -loglevel error || {
            echo "⚠️  Failed to convert $FILENAME"
            continue
        }

        # Check file size
        FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
        FILE_SIZE_KB=$((FILE_SIZE / 1024))

        echo "✓ $FILENAME created (${FILE_SIZE_KB}KB)"
    else
        echo "⚠️  Source file not found for $FILENAME"
    fi
done

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "=========================================="
echo "Download Summary:"
ls -lh "$OUTPUT_DIR"/*.mp3 2>/dev/null | awk '{print $9, $5}'
echo "=========================================="
echo ""
echo "✅ Done! Audio files saved to: $OUTPUT_DIR"
echo ""
echo "Note: Freesound.org requires authentication for direct downloads."
echo "If downloads failed, please:"
echo "1. Visit https://freesound.org/"
echo "2. Create a free account"
echo "3. Manually download the following sound IDs:"
for SOUND_ID in "${!AUDIO_FILES[@]}"; do
    echo "   - https://freesound.org/people/-/sounds/$SOUND_ID/ -> ${AUDIO_FILES[$SOUND_ID]}"
done
