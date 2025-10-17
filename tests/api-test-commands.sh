#!/bin/bash

# 智能翻译工具API测试脚本
# 使用curl命令测试所有15个翻译工具的API功能
#
# 使用方法:
# ./api-test-commands.sh [tool-name]
# 如果不指定工具名，将测试所有工具

set -e

# 配置
BASE_URL="${TEST_BASE_URL:-http://localhost:3000}"
TIMEOUT=30
OUTPUT_DIR="./test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 执行API测试
test_api() {
    local tool_name="$1"
    local endpoint="$2"
    local test_data="$3"
    local description="$4"

    log_info "测试: $description"

    # 创建临时文件保存响应
    local response_file="$OUTPUT_DIR/${tool_name}_${TIMESTAMP}_response.json"

    # 执行curl命令
    local curl_cmd="curl -X POST \
        -H 'Content-Type: application/json' \
        -d '$test_data' \
        --connect-timeout $TIMEOUT \
        --max-time $TIMEOUT \
        --silent \
        --show-error \
        --write-out '%{http_code}|%{time_total}|%{size_download}' \
        '$BASE_URL$endpoint' \
        -o '$response_file'"

    log_info "执行: $endpoint"

    # 执行请求并获取状态信息
    local result=$(eval "$curl_cmd" 2>&1)
    local http_code=$(echo "$result" | cut -d'|' -f1)
    local time_total=$(echo "$result" | cut -d'|' -f2)
    local size_download=$(echo "$result" | cut -d'|' -f3)

    # 检查HTTP状态码
    if [ "$http_code" -eq 200 ]; then
        log_success "HTTP $http_code - ${time_total}s - ${size_download}字节"

        # 验证响应JSON格式
        if jq empty "$response_file" 2>/dev/null; then
            log_success "JSON格式有效"

            # 检查关键字段
            if jq -e '.translated' "$response_file" >/dev/null 2>&1; then
                log_success "包含翻译结果"
            else
                log_warning "缺少翻译结果字段"
            fi

            if jq -e '.languageInfo' "$response_file" >/dev/null 2>&1; then
                log_success "包含语言信息"
            fi
        else
            log_error "无效的JSON格式"
        fi
    else
        log_error "HTTP $http_code - ${time_total}s"

        # 显示错误响应
        if [ -f "$response_file" ] && [ -s "$response_file" ]; then
            log_error "错误响应: $(cat "$response_file")"
        fi
    fi

    echo ""
}

# 测试语言检测功能
test_language_detection() {
    local tool_name="$1"
    local endpoint="$2"
    local test_text="$3"
    local expected_language="$4"

    log_info "测试语言检测: $expected_language"

    local test_data="{\"text\":\"$test_text\",\"detectOnly\":true}"
    test_api "$tool_name" "$endpoint" "$test_data" "语言检测 - $expected_language"
}

# 测试翻译功能
test_translation() {
    local tool_name="$1"
    local endpoint="$2"
    local test_text="$3"
    local direction="$4"

    log_info "测试翻译: $direction"

    local test_data="{\"text\":\"$test_text\""
    if [ "$direction" != "" ]; then
        test_data+=",\"direction\":\"$direction\""
    fi
    test_data+="}"

    test_api "$tool_name" "$endpoint" "$test_data" "翻译 - $direction"
}

# 测试错误处理
test_error_handling() {
    local tool_name="$1"
    local endpoint="$2"

    log_info "测试错误处理"

    # 测试空输入
    test_api "$tool_name" "$endpoint" '{"text":""}' "空输入"

    # 测试无效JSON
    test_api "$tool_name" "$endpoint" 'invalid json' "无效JSON"

    # 测试超大文本
    local large_text=$(printf 'A%.0s' {1..10000})
    test_api "$tool_name" "$endpoint" "{\"text\":\"$large_text\"}" "超大文本"
}

# 优先级1：双语翻译工具测试
test_bilingual_tools() {
    log_info "开始测试优先级1：双语翻译工具"

    # 1. creole-to-english-translator
    test_language_detection "creole-to-english-translator" "/api/creole-to-english-translator" "Bonjou, koman ou ye?" "creole"
    test_language_detection "creole-to-english-translator" "/api/creole-to-english-translator" "Hello, how are you?" "english"
    test_translation "creole-to-english-translator" "/api/creole-to-english-translator" "Bonjou, koman ou ye?" "creole-to-en"
    test_translation "creole-to-english-translator" "/api/creole-to-english-translator" "Hello, how are you?" "en-to-creole"
    test_error_handling "creole-to-english-translator" "/api/creole-to-english-translator"

    # 2. chinese-to-english-translator
    test_language_detection "chinese-to-english-translator" "/api/chinese-to-english-translator" "你好，很高兴认识你！" "chinese"
    test_language_detection "chinese-to-english-translator" "/api/chinese-to-english-translator" "Hello, nice to meet you!" "english"
    test_translation "chinese-to-english-translator" "/api/chinese-to-english-translator" "你好，很高兴认识你！" "zh-to-en"
    test_translation "chinese-to-english-translator" "/api/chinese-to-english-translator" "Hello, nice to meet you!" "en-to-zh"
    test_error_handling "chinese-to-english-translator" "/api/chinese-to-english-translator"

    # 3. albanian-to-english
    test_language_detection "albanian-to-english" "/api/albanian-to-english" "Përshëndetje! Si jeni ju?" "albanian"
    test_language_detection "albanian-to-english" "/api/albanian-to-english" "Hello! How are you?" "english"
    test_translation "albanian-to-english" "/api/albanian-to-english" "Përshëndetje! Si jeni ju?" "al-to-en"
    test_translation "albanian-to-english" "/api/albanian-to-english" "Hello! How are you?" "en-to-al"
    test_error_handling "albanian-to-english" "/api/albanian-to-english"

    # 4. samoan-to-english-translator
    test_language_detection "samoan-to-english-translator" "/api/samoan-to-english-translator" "Talofa! Manuia faiva?" "samoan"
    test_language_detection "samoan-to-english-translator" "/api/samoan-to-english-translator" "Hello! How is the work?" "english"
    test_translation "samoan-to-english-translator" "/api/samoan-to-english-translator" "Talofa! Manuia faiva?" "sm-to-en"
    test_translation "samoan-to-english-translator" "/api/samoan-to-english-translator" "Hello! How is the work?" "en-to-sm"
    test_error_handling "samoan-to-english-translator" "/api/samoan-to-english-translator"

    # 5. cantonese-translator
    test_language_detection "cantonese-translator" "/api/cantonese-translator" "你好！食咗飯未呀？" "cantonese"
    test_language_detection "cantonese-translator" "/api/cantonese-translator" "Hello! Have you eaten yet?" "english"
    test_translation "cantonese-translator" "/api/cantonese-translator" "你好！食咗飯未呀？" "yue-to-en"
    test_translation "cantonese-translator" "/api/cantonese-translator" "Hello! Have you eaten yet?" "en-to-yue"
    test_error_handling "cantonese-translator" "/api/cantonese-translator"
}

# 优先级2：特殊语言工具测试
test_special_tools() {
    log_info "开始测试优先级2：特殊语言工具"

    # 1. aramaic-translator
    test_language_detection "aramaic-translator" "/api/aramaic-translator" "ܫܠܡܐ ܥܠܝܟ" "aramaic"
    test_language_detection "aramaic-translator" "/api/aramaic-translator" "Peace be upon you" "english"
    test_translation "aramaic-translator" "/api/aramaic-translator" "Peace be upon you" "toAramaic"
    test_translation "aramaic-translator" "/api/aramaic-translator" "ܫܠܡܐ ܥܠܝܟ" "toEnglish"
    test_error_handling "aramaic-translator" "/api/aramaic-translator"

    # 2. baybayin-translator
    test_translation "baybayin-translator" "/api/baybayin-translator" "Hello Philippines" "toBaybayin"
    test_translation "baybayin-translator" "/api/baybayin-translator" "ᜃᜆᜓᜎᜓᜇ᜔ ᜉ᜔ᜁᜎᜒᜉᜒᜈ᜔" "fromBaybayin"
    test_error_handling "baybayin-translator" "/api/baybayin-translator"

    # 3. cuneiform-translator
    test_translation "cuneiform-translator" "/api/cuneiform-translator" "Ancient Mesopotamia" "toCuneiform"
    test_translation "cuneiform-translator" "/api/cuneiform-translator" "楔形文字" "fromCuneiform"
    test_error_handling "cuneiform-translator" "/api/cuneiform-translator"

    # 4. gaster-translator
    test_translation "gaster-translator" "/api/gaster-translator" "Hello world" "toGaster"
    test_translation "gaster-translator" "/api/gaster-translator" "♦♠♣♥" "fromGaster"
    test_error_handling "gaster-translator" "/api/gaster-translator"

    # 5. high-valyrian-translator
    test_translation "high-valyrian-translator" "/api/high-valyrian-translator" "Fire and blood" "toValyrian"
    test_translation "high-valyrian-translator" "/api/high-valyrian-translator" "Zaldrīzes buzdari iksos" "fromValyrian"
    test_error_handling "high-valyrian-translator" "/api/high-valyrian-translator"
}

# 优先级4：古典/虚构语言工具测试
test_classical_tools() {
    log_info "开始测试优先级4：古典/虚构语言工具"

    # 1. ancient-greek-translator
    test_translation "ancient-greek-translator" "/api/ancient-greek-translator" "Hello my friend" "toGreek"
    test_translation "ancient-greek-translator" "/api/ancient-greek-translator" "χαῖρε φίλε" "fromGreek"
    test_error_handling "ancient-greek-translator" "/api/ancient-greek-translator"

    # 2. middle-english-translator
    test_translation "middle-english-translator" "/api/middle-english-translator" "When April with its sweet showers" "toMiddleEnglish"
    test_translation "middle-english-translator" "/api/middle-english-translator" "Whan that Aprille with his shoures soote" "fromMiddleEnglish"
    test_error_handling "middle-english-translator" "/api/middle-english-translator"

    # 3. esperanto-translator
    test_translation "esperanto-translator" "/api/esperanto-translator" "Hello world" "toEsperanto"
    test_translation "esperanto-translator" "/api/esperanto-translator" "Saluton mondo" "fromEsperanto"
    test_error_handling "esperanto-translator" "/api/esperanto-translator"

    # 4. al-bhed-translator
    test_translation "al-bhed-translator" "/api/al-bhed-translator" "Hello friend" "toAlBhed"
    test_translation "al-bhed-translator" "/api/al-bhed-translator" "Oui fam" "fromAlBhed"
    test_error_handling "al-bhed-translator" "/api/al-bhed-translator"

    # 5. pig-latin-translator
    test_translation "pig-latin-translator" "/api/pig-latin-translator" "Hello world" "toPigLatin"
    test_translation "pig-latin-translator" "/api/pig-latin-translator" "Ellohay orldway" "fromPigLatin"
    test_error_handling "pig-latin-translator" "/api/pig-latin-translator"
}

# 性能测试
test_performance() {
    log_info "开始性能测试"

    local tools=(
        "creole-to-english-translator:/api/creole-to-english-translator"
        "chinese-to-english-translator:/api/chinese-to-english-translator"
        "albanian-to-english:/api/albanian-to-english"
        "samoan-to-english-translator:/api/samoan-to-english-translator"
        "cantonese-translator:/api/cantonese-translator"
    )

    for tool_config in "${tools[@]}"; do
        local tool_name=$(echo "$tool_config" | cut -d':' -f1)
        local endpoint=$(echo "$tool_config" | cut -d':' -f2)

        log_info "性能测试: $tool_name"

        # 单次请求响应时间
        local start_time=$(date +%s%N)
        curl -X POST \
            -H 'Content-Type: application/json' \
            -d '{"text":"Hello world"}' \
            --silent \
            "$BASE_URL$endpoint" > /dev/null
        local end_time=$(date +%s%N)
        local duration=$(( (end_time - start_time) / 1000000 ))

        log_info "$tool_name 响应时间: ${duration}ms"

        # 并发测试 (5个并发请求)
        log_info "并发测试 (5个请求): $tool_name"
        local concurrent_start=$(date +%s%N)

        for i in {1..5}; do
            curl -X POST \
                -H 'Content-Type: application/json' \
                -d '{"text":"Hello world"}' \
                --silent \
                "$BASE_URL$endpoint" > "/dev/null" 2>&1 &
        done

        wait
        local concurrent_end=$(date +%s%N)
        local concurrent_duration=$(( (concurrent_end - concurrent_start) / 1000000 ))

        log_info "$tool_name 并发完成时间: ${concurrent_duration}ms"
        echo ""
    done
}

# 生成测试报告
generate_report() {
    log_info "生成测试报告"

    local report_file="$OUTPUT_DIR/test_report_$TIMESTAMP.md"

    cat > "$report_file" << EOF
# 智能翻译工具API测试报告

**测试时间**: $(date)
**基础URL**: $BASE_URL
**超时设置**: ${TIMEOUT}秒

## 测试概览

本报告包含15个智能翻译工具的API测试结果。

### 工具分类

- **优先级1 (双语翻译工具)**: 5个工具
- **优先级2 (特殊语言工具)**: 5个工具
- **优先级4 (古典/虚构语言工具)**: 5个工具

### 测试类型

1. **语言检测测试** - 验证自动语言识别功能
2. **翻译功能测试** - 验证双向翻译能力
3. **错误处理测试** - 验证异常情况处理
4. **性能测试** - 验证响应时间和并发能力

## 测试结果详情

详细的响应数据保存在以下文件中:
- $(ls "$OUTPUT_DIR"/*_response.json 2>/dev/null | wc -l) 个响应文件

## 建议和后续行动

1. 检查所有失败的测试用例
2. 优化响应时间超过5秒的API
3. 统一错误响应格式
4. 添加更详细的错误信息

---
*报告生成时间: $(date)*
EOF

    log_success "测试报告已生成: $report_file"
}

# 主函数
main() {
    local target_tool="$1"

    echo "======================================"
    echo "智能翻译工具API测试脚本"
    echo "======================================"
    echo "基础URL: $BASE_URL"
    echo "输出目录: $OUTPUT_DIR"
    echo "时间戳: $TIMESTAMP"
    echo ""

    # 检查jq命令
    if ! command -v jq &> /dev/null; then
        log_warning "jq未安装，JSON验证将被跳过"
        log_info "安装jq: brew install jq (macOS) 或 apt-get install jq (Ubuntu)"
    fi

    # 根据参数执行测试
    if [ "$target_tool" = "" ]; then
        log_info "测试所有工具..."
        test_bilingual_tools
        test_special_tools
        test_classical_tools
        test_performance
    else
        case "$target_tool" in
            "bilingual")
                test_bilingual_tools
                ;;
            "special")
                test_special_tools
                ;;
            "classical")
                test_classical_tools
                ;;
            "performance")
                test_performance
                ;;
            *)
                log_error "未知工具类型: $target_tool"
                echo "支持的类型: bilingual, special, classical, performance"
                exit 1
                ;;
        esac
    fi

    generate_report

    log_success "所有测试完成！"
}

# 显示帮助信息
show_help() {
    echo "智能翻译工具API测试脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [工具类型]"
    echo ""
    echo "工具类型:"
    echo "  bilingual   - 测试双语翻译工具 (优先级1)"
    echo "  special     - 测试特殊语言工具 (优先级2)"
    echo "  classical   - 测试古典/虚构语言工具 (优先级4)"
    echo "  performance - 仅进行性能测试"
    echo "  (无参数)    - 测试所有工具"
    echo ""
    echo "环境变量:"
    echo "  TEST_BASE_URL - API基础URL (默认: http://localhost:3000)"
    echo ""
    echo "示例:"
    echo "  $0                    # 测试所有工具"
    echo "  $0 bilingual          # 仅测试双语工具"
    echo "  TEST_BASE_URL=https://api.example.com $0 special  # 测试特定环境的特殊工具"
}

# 检查参数
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# 执行主函数
main "$@"