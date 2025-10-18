# API 测试工具使用指南

本文档介绍如何使用我们为 vibetrans 项目创建的全面 API 测试工具套件。

## 🛠️ 工具概览

我们提供了三个主要的 API 测试工具：

1. **全面 API 测试** (`test-all-apis.ts`) - 深度测试所有 API 端点
2. **快速健康检查** (`quick-api-test.ts`) - 快速验证关键 API 状态
3. **持续监控** (`api-monitor.ts`) - 长期监控 API 性能和可用性

## 🚀 快速开始

### 前提条件

确保你的开发服务器正在运行：
```bash
pnpm dev
```

### 可用命令

```bash
# 完整的 API 测试（推荐在部署前运行）
pnpm api:test

# 快速健康检查（CI/CD 友好）
pnpm api:test:quick

# 启动持续监控
pnpm api:monitor

# 查看监控报告
pnpm api:monitor:report
```

## 📋 详细使用说明

### 1. 全面 API 测试 (`pnpm api:test`)

这是最全面的测试工具，会测试所有 27 个翻译工具的 API。

**测试内容：**
- ✅ 连接性测试（API 是否可访问）
- ✅ GET 请求测试（API 信息查询）
- ✅ POST 请求测试（主要功能）
- ✅ 错误处理测试（无效输入处理）
- ⏱️ 性能监控（响应时间）

**输出格式：**
- 控制台实时显示测试进度
- 生成详细的 JSON 报告文件
- 生成 Markdown 格式的可读报告

**示例输出：**
```
🧪 Testing Baybayin Translator...
   API: /api/baybayin-translator
   ✅ ✓ Connectivity | ✓ GET | ✓ POST | ✓ Error Handling

🧪 Testing Dog Translator...
   API: /api/dog-translator
   ✅ ✓ Connectivity | ✓ GET | ✓ POST | ✓ Error Handling
```

**环境变量：**
```bash
# 设置测试基础 URL（默认: http://localhost:3000）
export TEST_BASE_URL="http://localhost:3000"
```

### 2. 快速健康检查 (`pnpm api:test:quick`)

轻量级测试，专注于最重要的 8 个 API。

**特点：**
- ⚡ 快速执行（每个 API 5 秒超时）
- 🎯 专注于核心功能
- 📊 生成简洁的摘要报告
- 🔄 CI/CD 友好（退出码反映 API 状态）

**使用场景：**
- CI/CD 管道中的快速检查
- 部署前的快速验证
- 定期健康检查

**退出码：**
- `0`: 所有 API 正常
- `1`: 有 API 离线或异常

### 3. 持续监控 (`pnpm api:monitor`)

长期监控 API 性能和可用性，适合生产环境。

**功能：**
- 📈 实时监控（默认每分钟检查一次）
- 📊 历史数据记录（保存 24 小时数据）
- ⚠️ 性能警告（响应时间阈值）
- 📱 交互式报告生成

**交互命令：**
- `r`: 生成实时报告
- `q`: 退出监控
- `Ctrl+C`: 停止监控

**监控指标：**
- API 在线状态
- 响应时间趋势
- 健康率百分比
- 错误模式分析

**自定义配置：**
```bash
# 设置检查间隔（秒）
pnpm api:monitor --interval 30

# 设置响应时间警告阈值（毫秒）
pnpm api:monitor --threshold 3000
```

## 📊 报告解读

### JSON 报告结构

```json
{
  "summary": {
    "totalTools": 27,
    "successful": 25,
    "failed": 2,
    "errors": 0,
    "averageResponseTime": {
      "connectivity": 123,
      "getInfo": 156,
      "postFunction": 2341,
      "errorHandling": 89
    }
  },
  "results": [...]
}
```

### 状态说明

- ✅ **Success**: 所有测试通过
- ⚠️ **Error**: 部分测试失败，但核心功能可用
- ❌ **Failed**: 关键功能不可用

### 性能指标

- 🟢 **正常**: < 1 秒
- 🟡 **警告**: 1-5 秒
- 🔴 **慢**: > 5 秒

## 🔧 高级配置

### 测试环境配置

```bash
# .env.local
TEST_BASE_URL="https://your-domain.com"
API_TIMEOUT=30000
RETRY_ATTEMPTS=3
```

### 自定义 API 列表

修改 `test-all-apis.ts` 中的 `TOOLS_APIS` 数组来添加或移除要测试的 API：

```typescript
const TOOLS_APIS = [
  { name: 'Your Tool', page: '/your-tool', api: '/api/your-tool' },
  // ... 添加更多
];
```

### 集成到 CI/CD

**GitHub Actions 示例：**
```yaml
name: API Health Check
on: [push, pull_request]

jobs:
  api-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Start development server
        run: pnpm dev &

      - name: Wait for server
        run: sleep 10

      - name: Run API tests
        run: pnpm api:test:quick
```

## 🐛 故障排除

### 常见问题

1. **API 超时**
   ```
   解决方案：增加超时时间或检查网络连接
   export API_TIMEOUT=60000
   ```

2. **连接被拒绝**
   ```
   确保开发服务器正在运行
   pnpm dev
   ```

3. **AI 模型错误**
   ```
   检查环境变量配置
   确保 API 密钥有效
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=api:* pnpm api:test

# 测试特定 API
npx tsx scripts/test-all-apis.ts --filter "baybayin"
```

## 📈 监控最佳实践

### 生产环境监控

1. **设置适当的监控间隔**
   - 生产环境：5-15 分钟
   - 开发环境：1-5 分钟

2. **配置告警阈值**
   - 响应时间 > 5 秒：警告
   - 健康率 < 95%：严重警告
   - API 离线 > 1 分钟：紧急

3. **定期清理历史数据**
   - 保留最近 7 天的详细数据
   - 保留最近 30 天的摘要数据

### 性能优化建议

1. **缓存策略**
   - 静态 API 响应缓存 5 分钟
   - 错误状态缓存 1 分钟

2. **并发控制**
   - 限制并发请求数量
   - 实施指数退避重试

3. **资源优化**
   - 使用连接池
   - 压缩响应数据

## 📞 支持

如果遇到问题：

1. 检查 [GitHub Issues](../../issues)
2. 查看项目文档
3. 联系开发团队

---

**注意**: 这些测试工具设计为开发和生产环境友好，但建议在生产环境中的低峰期运行全面测试。