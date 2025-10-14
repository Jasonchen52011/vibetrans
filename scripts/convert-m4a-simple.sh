#!/bin/bash

# Simple audio converter using macOS built-in tools (afconvert)
# No external dependencies required

set -e

INPUT_DIR="public/audio/baby-cries"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Converting m4a files to mp3...${NC}"

# Convert existing m4a files
for file in "$INPUT_DIR"/*.m4a; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .m4a)
        output="$INPUT_DIR/${filename}.mp3"

        echo -e "Converting: ${YELLOW}$filename${NC}"

        # Convert m4a to mp3 using afconvert
        # First convert to WAV, then use lame to convert to MP3
        temp_wav="/tmp/${filename}.wav"

        # Convert to WAV
        afconvert -f WAVE -d LEI16 "$file" "$temp_wav"

        # If lame is available, use it; otherwise just keep the m4a
        if command -v lame &> /dev/null; then
            lame -b 64 --resample 44.1 "$temp_wav" "$output"
            rm "$temp_wav"
            echo -e "${GREEN}✓ Created $output${NC}"
        else
            echo -e "${YELLOW}⚠️  lame not found, keeping m4a format${NC}"
            rm "$temp_wav"
        fi
    fi
done

echo -e "${GREEN}Done!${NC}"
