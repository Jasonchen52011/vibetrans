# 智能翻译工具测试套件

这是为15个智能翻译工具设计的完整测试套件，涵盖API功能、前端交互、性能和集成测试。

## 🎯 测试范围

### 优先级1：双语翻译工具 (5个)
1. **creole-to-english-translator** - 海地克里奥尔语↔英语
2. **chinese-to-english-translator** - 中文↔英语 (支持多媒体)
3. **albanian-to-english** - 阿尔巴尼亚语↔英语
4. **samoan-to-english-translator** - 萨摩亚语↔英语
5. **cantonese-translator** - 粤语↔英语

### 优先级2：特殊语言工具 (5个)
6. **aramaic-translator** - 阿拉姆语↔英语
7. **baybayin-translator** - 巴贝因文字翻译
8. **cuneiform-translator** - 楔形文字翻译
9. **gaster-translator** - Gaster符号语言翻译
10. **high-valyrian-translator** - 瓦雷利亚语翻译

### 优先级4：古典/虚构语言工具 (5个)
11. **ancient-greek-translator** - 古希腊语翻译
12. **middle-english-translator** - 中古英语翻译
13. **esperanto-translator** - 世界语翻译
14. **al-bhed-translator** - Al Bhed密码语言翻译
15. **pig-latin-translator** - 猪拉丁语翻译

## 📁 文件结构

```
tests/
├── README.md                           # 本文档
├── translator-tools-test-suite.ts     # TypeScript完整测试套件
├── api-test-commands.sh               # Shell脚本API测试
├── frontend-interaction-tests.js      # 前端交互测试
├── run-all-tests.js                   # 主测试运行器
├── test-config.json                   # 测试配置文件
└── test-results/                      # 测试结果目录
    ├── reports/                       # 测试报告
    ├── screenshots/                   # 前端测试截图
    └── *.json                        # API响应数据
```

## 🚀 快速开始

### 1. 环境准备

确保开发服务器正在运行：
```bash
pnpm dev
```

安装测试依赖（如果需要前端测试）：
```bash
npm install puppeteer
```

### 2. 运行测试

#### 运行所有测试
```bash
node tests/run-all-tests.js
```

#### 运行特定类型测试
```bash
# 仅API测试
./tests/api-test-commands.sh

# 仅前端测试
node tests/frontend-interaction-tests.js

# 仅性能测试
./tests/api-test-commands.sh performance
```

#### 运行分类测试
```bash
# 双语翻译工具
./tests/api-test-commands.sh bilingual

# 特殊语言工具
./tests/api-test-commands.sh special

# 古典/虚构语言工具
./tests/api-test-commands.sh classical
```

### 3. 自定义配置

通过环境变量配置测试：

```bash
# 自定义测试URL
TEST_BASE_URL=https://staging.example.com node tests/run-all-tests.js

# 显示浏览器界面（前端测试）
HEADLESS=false node tests/run-all-tests.js

# 自定义超时时间
TIMEOUT=60000 node tests/run-all-tests.js
```

## 📊 测试类型

### 1. API功能测试
- **语言检测测试**：验证自动语言识别功能
- **翻译功能测试**：验证双向翻译能力
- **错误处理测试**：验证异常情况处理
- **多媒体支持测试**：验证图片、语音输入（如果支持）

### 2. 前端交互测试
- **页面加载测试**：验证页面正常加载和渲染
- **UI交互测试**：验证按钮、表单、动态更新
- **文件上传测试**：验证文件上传功能
- **复制/下载测试**：验证结果导出功能

### 3. 性能测试
- **响应时间测试**：测量API响应时间
- **并发测试**：验证并发请求处理能力
- **大文本测试**：验证长文本处理性能

### 4. 集成测试
- **端到端测试**：验证完整翻译流程
- **跨工具测试**：验证不同工具间的一致性
- **错误恢复测试**：验证错误情况的恢复能力

## 📋 测试用例详解

### 语言检测测试
每个支持语言检测的工具都会测试以下场景：

| 测试场景 | 输入示例 | 期望结果 |
|---------|---------|---------|
| 目标语言输入 | "Bonjou, koman ou ye?" | 检测为克里奥尔语 |
| 英语输入 | "Hello, how are you?" | 检测为英语 |
| 混合语言输入 | "Hello koman ou ye" | 低置信度或混合语言 |
| 空输入 | "" | 错误处理 |
| 特殊字符 | "À bientôt! Ça va?" | 正确处理Unicode |

### 翻译功能测试
验证以下翻译场景：

| 功能 | 测试内容 |
|------|---------|
| 自动方向检测 | 根据输入语言自动选择翻译方向 |
| 手动方向覆盖 | 用户可以手动指定翻译方向 |
| 翻译质量 | 输出结果应该是有意义的翻译 |
| 错误处理 | 无效输入或API错误的处理 |

### 前端交互测试
验证用户界面的各项功能：

| 交互元素 | 测试内容 |
|---------|---------|
| 语言检测提示 | 实时显示检测到的语言 |
| 方向切换 | 手动切换翻译方向按钮 |
| 复制功能 | 一键复制翻译结果 |
| 清空功能 | 清空输入和输出内容 |
| 文件上传 | 支持文档、图片上传（如果适用） |

## 📈 测试报告

测试完成后会生成以下报告：

1. **JSON报告**：机器可读的详细数据
2. **HTML报告**：可视化的网页报告
3. **Markdown报告**：可读性强的文本报告

报告位置：`tests/test-results/reports/`

### 报告内容
- 📊 测试概览统计
- 📋 详细测试结果
- ⚠️ 发现的问题和建议
- 🎯 后续改进方向

## 🔧 配置说明

### test-config.json
```json
{
  "baseUrl": "http://localhost:3000",
  "timeout": 30000,
  "retryAttempts": 3,
  "testData": {
    "languageDetection": {
      "timeout": 2000,
      "confidenceThreshold": 0.7
    },
    "translation": {
      "maxLength": 5000,
      "expectedResponseTime": 5000
    },
    "frontend": {
      "viewport": { "width": 1366, "height": 768 },
      "headless": true
    }
  }
}
```

## 🐛 故障排除

### 常见问题

#### 1. 服务器连接失败
```
❌ 服务器无响应或不可访问
```
**解决方案**：
- 确保开发服务器运行：`pnpm dev`
- 检查端口是否正确：默认3000
- 检查防火墙设置

#### 2. 前端测试失败
```
❌ Puppeteer未安装
```
**解决方案**：
```bash
npm install puppeteer
```

#### 3. TypeScript编译错误
```
❌ TypeScript编译失败
```
**解决方案**：
- 检查TypeScript版本：`npx tsc --version`
- 安装依赖：`pnpm install`
- 跳过编译测试仍可运行

#### 4. API超时
```
❌ API请求超时
```
**解决方案**：
- 增加超时时间：`TIMEOUT=60000`
- 检查API性能
- 检查网络连接

### 调试技巧

#### 启用详细日志
```bash
DEBUG=* node tests/run-all-tests.js
```

#### 显示浏览器界面
```bash
HEADLESS=false node tests/run-all-tests.js
```

#### 运行单个工具测试
```bash
# API测试
./tests/api-test-commands.sh | grep "creole-to-english-translator"

# TypeScript测试
node tests/translator-tools-test-suite.js | grep "creole-to-english-translator"
```

## 🔄 CI/CD集成

### GitHub Actions示例
```yaml
name: Translation Tools Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: pnpm install

    - name: Start development server
      run: pnpm dev &

    - name: Wait for server
      run: sleep 30

    - name: Run tests
      run: node tests/run-all-tests.js
      env:
        TEST_BASE_URL: http://localhost:3000
        HEADLESS: true

    - name: Upload test reports
      uses: actions/upload-artifact@v2
      with:
        name: test-reports
        path: tests/test-results/reports/
```

## 📝 添加新测试

### 1. 添加新的翻译工具测试

在 `translator-tools-test-suite.ts` 中添加工具配置：

```typescript
const TRANSLATOR_TOOLS = {
  'new-translator': {
    category: 'bilingual',
    priority: 1,
    apiEndpoint: '/api/new-translator',
    supportedFeatures: ['text', 'language-detection'],
    testCases: {
      sourceLanguageInput: '测试文本',
      englishInput: 'Test text',
      // ... 更多测试用例
    }
  }
  // ... 其他工具
};
```

### 2. 添加新的测试用例

在相应的测试函数中添加新的测试逻辑：

```typescript
private async testLanguageDetection(toolName: string, config: any): Promise<TestSectionResult> {
  // ... 现有测试逻辑

  // 添加新测试用例
  testCases.push(await this.runTestCase(
    '新测试用例',
    async () => {
      // 测试逻辑
      return expectedResult;
    }
  ));
}
```

### 3. 更新API测试脚本

在 `api-test-commands.sh` 中添加新的测试：

```bash
test_new_translator() {
    test_language_detection "new-translator" "/api/new-translator" "测试文本" "target-language"
    test_translation "new-translator" "/api/new-translator" "测试文本" "direction"
    test_error_handling "new-translator" "/api/new-translator"
}
```

## 📞 支持和反馈

如果遇到问题或有改进建议，请：

1. 查看本README的故障排除部分
2. 检查测试日志和报告
3. 提交Issue或Pull Request

## 📄 许可证

本测试套件遵循项目的开源许可证。

---

*最后更新: 2024年*