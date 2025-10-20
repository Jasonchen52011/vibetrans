#!/bin/bash

# Quick UI Changes Test Script
# 快速UI更改测试脚本

echo "🎨 UI Changes Quick Test"
echo "======================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${YELLOW}Testing file existence and basic configurations...${NC}"
echo ""

# Test 1: Font files existence
echo "1. Testing font files..."
if [ -f "src/fonts/satoshi-regular.woff2" ] && [ -f "src/fonts/satoshi-bold.woff2" ]; then
    echo "${GREEN}✓ Font files exist${NC}"
else
    echo "${RED}✗ Font files missing${NC}"
fi

# Test 2: Layout configuration
echo ""
echo "2. Testing layout configuration..."
if grep -q "const satoshi" src/app/\[locale\]/layout.tsx; then
    echo "${GREEN}✓ Satoshi font configured in layout${NC}"
else
    echo "${RED}✗ Satoshi font not found in layout${NC}"
fi

# Test 3: CSS variables
echo ""
echo "3. Testing CSS variables..."
if grep -q "font-sans" src/styles/globals.css; then
    echo "${GREEN}✓ CSS font variables configured${NC}"
else
    echo "${RED}✗ CSS font variables not found${NC}"
fi

# Test 4: BackToTop component
echo ""
echo "4. Testing BackToTop component..."
if [ -f "src/components/BackToTop.tsx" ]; then
    echo "${GREEN}✓ BackToTop component exists${NC}"
else
    echo "${RED}✗ BackToTop component missing${NC}"
fi

# Test 5: Tool files for max-w-7xl
echo ""
echo "5. Testing tool container width..."
TOOL_FILES=$(find src/app -name "*Tool.tsx" 2>/dev/null | head -5)
FOUND_W7XL=false
for file in $TOOL_FILES; do
    if grep -q "max-w-7xl" "$file"; then
        FOUND_W7XL=true
        echo "${GREEN}✓ Found max-w-7xl in $file${NC}"
    fi
done

if [ "$FOUND_W7XL" = false ]; then
    echo "${RED}✗ max-w-7xl not found in tool components${NC}"
fi

# Test 6: CTA button icons
echo ""
echo "6. Testing CTA button icons..."
ICON_FOUND=false
for file in $TOOL_FILES; do
    if grep -q "ArrowRightIcon" "$file"; then
        ICON_FOUND=true
        echo "${GREEN}✓ Found ArrowRightIcon in $file${NC}"
    fi
done

if [ "$ICON_FOUND" = false ]; then
    echo "${RED}✗ ArrowRightIcon not found in tool components${NC}"
fi

# Test 7: Explore text changes
echo ""
echo "7. Testing 'Explore more Translator Tools' text..."
EXPLORE_FOUND=false
for file in $TOOL_FILES; do
    if grep -q "Explore more Translator Tools" "$file"; then
        EXPLORE_FOUND=true
        echo "${GREEN}✓ Found updated explore text in $file${NC}"
    fi
done

if [ "$EXPLORE_FOUND" = false ]; then
    echo "${RED}✗ Updated explore text not found${NC}"
fi

# Test 8: No old text
echo ""
echo "8. Testing removal of old text..."
OLD_TEXT_FOUND=false
for file in $TOOL_FILES; do
    if grep -q "Explore Other AI Tools" "$file"; then
        OLD_TEXT_FOUND=true
        echo "${RED}✗ Found old explore text in $file${NC}"
    fi
done

if [ "$OLD_TEXT_FOUND" = false ]; then
    echo "${GREEN}✓ Old explore text successfully removed${NC}"
fi

echo ""
echo "${YELLOW}Manual Testing Required:${NC}"
echo "• Visual inspection of font rendering"
echo "• Interactive testing of BackToTop button"
echo "• Responsive layout testing on different screen sizes"
echo "• CTA button icon visibility and styling"
echo "• Overall visual consistency"

echo ""
echo "${BLUE}For comprehensive testing, run:${NC}"
echo "node test-ui-changes.js"

echo ""
echo "${YELLOW}Make sure development server is running:${NC}"
echo "pnpm dev"

echo ""
echo "${GREEN}Quick file-based test completed!${NC}"