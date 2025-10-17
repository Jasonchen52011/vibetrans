#!/bin/bash

# 测试修复后的4个翻译工具
echo "🧪 测试修复后的翻译工具..."
echo "========================================"

# 测试结果记录
RESULTS_FILE="fixed-tools-test-results.txt"
echo "修复工具测试报告" > $RESULTS_FILE
echo "测试时间: $(date)" >> $RESULTS_FILE
echo "========================================" >> $RESULTS_FILE

# 测试计数器
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# 测试函数
test_fixed_tool() {
    local tool_name=$1
    local api_endpoint=$2
    local test_text=$3

    echo "🔍 测试工具: $tool_name"
    echo "   API: $api_endpoint"

    TEST_COUNT=$((TEST_COUNT + 1))

    # 测试1: 智能检测
    echo "   📝 测试1: 智能语言检测"
    local response=$(curl -s -X POST http://localhost:3002$api_endpoint \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"$test_text\", \"detectOnly\": true}")

    if echo "$response" | grep -q "\"detectedInputLanguage\":"; then
        echo "   ✅ 智能检测成功"
        PASS_COUNT=$((PASS_COUNT + 1))
        echo "   $tool_name - 智能检测: ✅ PASS" >> $RESULTS_FILE
    else
        echo "   ❌ 智能检测失败"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo "   $tool_name - 智能检测: ❌ FAIL" >> $RESULTS_FILE
        echo "   响应: $response"
    fi

    # 测试2: 实际翻译
    echo "   📝 测试2: 实际翻译功能"
    response=$(curl -s -X POST http://localhost:3002$api_endpoint \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"$test_text\"}")

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

# 测试修复后的4个工具（Chinese-English需要特殊参数）
echo "🔍 测试工具: Chinese-English Translator"
echo "   API: /api/chinese-to-english-translator"

TEST_COUNT=$((TEST_COUNT + 1))

# 测试1: 智能检测
echo "   📝 测试1: 智能语言检测"
response=$(curl -s -X POST http://localhost:3002/api/chinese-to-english-translator \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Hello\", \"detectOnly\": true, \"inputType\": \"text\"}")

if echo "$response" | grep -q "\"detectedInputLanguage\":"; then
    echo "   ✅ 智能检测成功"
    PASS_COUNT=$((PASS_COUNT + 1))
    echo "   Chinese-English Translator - 智能检测: ✅ PASS" >> $RESULTS_FILE
else
    echo "   ❌ 智能检测失败"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "   Chinese-English Translator - 智能检测: ❌ FAIL" >> $RESULTS_FILE
    echo "   响应: $response"
fi

# 测试2: 实际翻译
echo "   📝 测试2: 实际翻译功能"
response=$(curl -s -X POST http://localhost:3002/api/chinese-to-english-translator \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Hello\", \"inputType\": \"text\"}")

if echo "$response" | grep -q "\"translated\":"; then
    echo "   ✅ 翻译功能正常"
    PASS_COUNT=$((PASS_COUNT + 1))
    echo "   Chinese-English Translator - 翻译功能: ✅ PASS" >> $RESULTS_FILE
else
    echo "   ❌ 翻译功能失败"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "   Chinese-English Translator - 翻译功能: ❌ FAIL" >> $RESULTS_FILE
    echo "   响应: $response"
fi

echo ""

test_fixed_tool "Gaster Translator" "/api/gaster-translator" "Hello there"
test_fixed_tool "High Valyrian Translator" "/api/high-valyrian-translator" "Hello friend"
test_fixed_tool "Middle English Translator" "/api/middle-english-translator" "Hello"

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
    echo "🎉 所有修复工具测试通过！"
else
    echo "⚠️ 有 $FAIL_COUNT 个测试失败，请检查详细日志"
fi

echo "详细测试报告已保存到: $RESULTS_FILE"