#!/bin/bash

# 智能翻译工具测试脚本
# 测试所有15个优化过的翻译工具

echo "🧪 开始测试智能翻译工具..."
echo "========================================"

# 测试结果记录
RESULTS_FILE="translator-test-results.txt"
echo "智能翻译工具测试报告" > $RESULTS_FILE
echo "测试时间: $(date)" >> $RESULTS_FILE
echo "========================================" >> $RESULTS_FILE

# 测试计数器
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# 测试函数
test_translator() {
    local tool_name=$1
    local api_endpoint=$2
    local test_text_en=$3
    local test_text_target=$4
    local target_language=$5

    echo "🔍 测试工具: $tool_name"
    echo "   API: $api_endpoint"

    TEST_COUNT=$((TEST_COUNT + 1))

    # 测试1: 英语检测和翻译
    echo "   📝 测试1: 英语输入检测"
    local response=$(curl -s -X POST http://localhost:3002$api_endpoint \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"$test_text_en\", \"detectOnly\": true}")

    if echo "$response" | grep -q "\"detectedInputLanguage\":\"english\""; then
        echo "   ✅ 英语检测成功"
        PASS_COUNT=$((PASS_COUNT + 1))
        echo "   $tool_name - 英语检测: ✅ PASS" >> $RESULTS_FILE
    else
        echo "   ❌ 英语检测失败"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo "   $tool_name - 英语检测: ❌ FAIL" >> $RESULTS_FILE
        echo "   响应: $response"
    fi

    # 测试2: 目标语言检测
    echo "   📝 测试2: $target_language 输入检测"
    response=$(curl -s -X POST http://localhost:3002$api_endpoint \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"$test_text_target\", \"detectOnly\": true}")

    if echo "$response" | grep -q "\"detectedInputLanguage\":\"$target_language\""; then
        echo "   ✅ $target_language 检测成功"
        PASS_COUNT=$((PASS_COUNT + 1))
        echo "   $tool_name - $target_language 检测: ✅ PASS" >> $RESULTS_FILE
    else
        echo "   ❌ $target_language 检测失败"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo "   $tool_name - $target_language 检测: ❌ FAIL" >> $RESULTS_FILE
        echo "   响应: $response"
    fi

    # 测试3: 实际翻译功能
    echo "   📝 测试3: 实际翻译功能"
    response=$(curl -s -X POST http://localhost:3002$api_endpoint \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"$test_text_en\"}")

    if echo "$response" | grep -q "\"translated\":"; then
        echo "   ✅ 翻译功能正常"
        PASS_COUNT=$((PASS_COUNT + 1))
        echo "   $tool_name - 翻译功能: ✅ PASS" >> $RESULTS_FILE
    else
        echo "   ❌ 翻译功能失败"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo "   $tool_name - 翻译功能: ❌ FAIL" >> $RESULTS_FILE
        echo "   响应: $response"
    fi

    echo ""
}

echo "========================================" >> $RESULTS_FILE
echo "测试详情:" >> $RESULTS_FILE

# 优先级1: 双语翻译工具
echo "🎯 测试优先级1: 双语翻译工具"

# 1. Creole-English Translator
test_translator "Creole-English" "/api/creole-to-english-translator" "Hello my friend" "Bonjou zanmi mwen" "creole"

# 2. Chinese-English Translator (需要特殊参数)
echo "🔍 测试工具: Chinese-English"
echo "   API: /api/chinese-to-english-translator"

TEST_COUNT=$((TEST_COUNT + 1))

# 测试1: 英语检测和翻译
echo "   📝 测试1: 英语输入检测"
response=$(curl -s -X POST http://localhost:3002/api/chinese-to-english-translator \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Hello, how are you?\", \"detectOnly\": true, \"inputType\": \"text\"}")

if echo "$response" | grep -q "\"detectedInputLanguage\":\"english\""; then
    echo "   ✅ 英语检测成功"
    PASS_COUNT=$((PASS_COUNT + 1))
    echo "   Chinese-English - 英语检测: ✅ PASS" >> $RESULTS_FILE
else
    echo "   ❌ 英语检测失败"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "   Chinese-English - 英语检测: ❌ FAIL" >> $RESULTS_FILE
    echo "   响应: $response"
fi

# 测试2: 中文检测
echo "   📝 测试2: chinese 输入检测"
response=$(curl -s -X POST http://localhost:3002/api/chinese-to-english-translator \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"你好，你好吗？\", \"detectOnly\": true, \"inputType\": \"text\"}")

if echo "$response" | grep -q "\"detectedInputLanguage\":\"chinese\""; then
    echo "   ✅ chinese 检测成功"
    PASS_COUNT=$((PASS_COUNT + 1))
    echo "   Chinese-English - chinese 检测: ✅ PASS" >> $RESULTS_FILE
else
    echo "   ❌ chinese 检测失败"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "   Chinese-English - chinese 检测: ❌ FAIL" >> $RESULTS_FILE
    echo "   响应: $response"
fi

# 测试3: 实际翻译功能
echo "   📝 测试3: 实际翻译功能"
response=$(curl -s -X POST http://localhost:3002/api/chinese-to-english-translator \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Hello, how are you?\", \"inputType\": \"text\"}")

if echo "$response" | grep -q "\"translated\":"; then
    echo "   ✅ 翻译功能正常"
    PASS_COUNT=$((PASS_COUNT + 1))
    echo "   Chinese-English - 翻译功能: ✅ PASS" >> $RESULTS_FILE
else
    echo "   ❌ 翻译功能失败"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "   Chinese-English - 翻译功能: ❌ FAIL" >> $RESULTS_FILE
    echo "   响应: $response"
fi

echo ""

# 3. Albanian-English
test_translator "Albanian-English" "/api/albanian-to-english" "Hello, my friend" "Përshëndetje, mik imi" "albanian"

# 4. Samoan-English
test_translator "Samoan-English" "/api/samoan-to-english-translator" "Hello, how are you?" "Talofa, oe o lelei?" "samoan"

# 5. Cantonese-English
test_translator "Cantonese-English" "/api/cantonese-translator" "Hello, how are you?" "你好，你好嗎？" "cantonese"

echo "========================================"
echo "🎯 测试优先级2: 特殊语言工具"

# 6. Aramaic Translator
test_translator "Aramaic-English" "/api/aramaic-translator" "Hello, peace be upon you" "ܫܠܡܐ ܥܠܝܟ" "aramaic"

# 7. Baybayin Translator
test_translator "Baybayin-English" "/api/baybayin-translator" "Hello friend" "ᜀᜋᜎ ᜁᜈᜆ" "baybayin"

# 8. Cuneiform Translator
test_translator "Cuneiform-English" "/api/cuneiform-translator" "Hello king" "𒈹𒂍𒀀" "cuneiform"

# 9. Gaster Translator
test_translator "Gaster-English" "/api/gaster-translator" "Hello there" "♣♠♥♦" "gaster"

# 10. High Valyrian Translator
test_translator "High Valyrian-English" "/api/high-valyrian-translator" "Hello friend" "Rytsas" "valyrian"

echo "========================================"
echo "🎯 测试优先级4: 古典/虚构语言"

# 11. Ancient Greek Translator
test_translator "Ancient Greek-English" "/api/ancient-greek-translator" "Hello" "χαῖρε" "greek"

# 12. Middle English Translator
test_translator "Middle English-English" "/api/middle-english-translator" "Hello" "Whan that" "middle-english"

# 13. Esperanto Translator
test_translator "Esperanto-English" "/api/esperanto-translator" "Hello" "Saluton" "esperanto"

# 14. Al Bhed Translator
test_translator "Al Bhed-English" "/api/al-bhed-translator" "Hello" "Oui" "al-bhed"

# 15. Pig Latin Translator
test_translator "Pig Latin-English" "/api/pig-latin-translator" "Hello" "Ellohay" "pig-latin"

# 测试总结
echo "========================================"
echo "📊 测试总结"
echo "总测试数: $TEST_COUNT"
echo "通过: $PASS_COUNT"
echo "失败: $FAIL_COUNT"
echo "成功率: $(( PASS_COUNT * 100 / TEST_COUNT ))%"

echo "========================================" >> $RESULTS_FILE
echo "测试总结:" >> $RESULTS_FILE
echo "总测试数: $TEST_COUNT" >> $RESULTS_FILE
echo "通过: $PASS_COUNT" >> $RESULTS_FILE
echo "失败: $FAIL_COUNT" >> $RESULTS_FILE
echo "成功率: $(( PASS_COUNT * 100 / TEST_COUNT ))%" >> $RESULTS_FILE
echo "========================================" >> $RESULTS_FILE

if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 所有测试通过！"
else
    echo "⚠️ 有 $FAIL_COUNT 个测试失败，请检查详细日志"
fi

echo "详细测试报告已保存到: $RESULTS_FILE"