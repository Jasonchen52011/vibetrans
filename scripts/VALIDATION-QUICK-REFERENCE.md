# 验证功能快速参考

## 快速使用

### 1. 完整流程（推荐）
```bash
node scripts/auto-tool-generator.js "tool name"
```

### 2. 禁用字数验证
```bash
ENABLE_WORD_COUNT_VALIDATION=false node scripts/auto-tool-generator.js "tool name"
```

### 3. 禁用页面检查
```bash
ENABLE_PAGE_ERROR_CHECK=false node scripts/auto-tool-generator.js "tool name"
```

### 4. 全部禁用
```bash
ENABLE_WORD_COUNT_VALIDATION=false ENABLE_PAGE_ERROR_CHECK=false node scripts/auto-tool-generator.js "tool name"
```

---

## 字数要求速查表

| Section | 要求 | 允许范围 |
|---------|------|---------|
| H1 | 5-7 | 严格 |
| Hero描述 | 30-40 | 25-45 |
| What Is | 70 | 65-75 |
| Example | 40-50 | 35-55 |
| How To步骤 | 40 | 35-45 |
| Fun Facts | 30 | 25-35 |
| 趣味板块 | 60 | 55-65 |
| 亮点功能 | 50 | 45-55 |
| 用户评价 | 50-60 | 45-65 |
| FAQ | 30-80 | 严格 |

---

## 配置选项

在代码中修改 `CONFIG` 对象：

```javascript
const CONFIG = {
  // 字数验证开关（默认：开启）
  enableWordCountValidation: process.env.ENABLE_WORD_COUNT_VALIDATION !== 'false',

  // 页面检查开关（默认：开启）
  enablePageErrorCheck: process.env.ENABLE_PAGE_ERROR_CHECK !== 'false',

  // 开发服务器端口（默认：3000）
  devServerPort: process.env.DEV_SERVER_PORT || 3000,

  // 字数验证最大重试次数（默认：2）
  maxWordCountRetries: 2,

  // 页面检查超时（默认：30秒）
  pageCheckTimeout: 30000,
};
```

---

## 故障排查

### 字数验证问题

**问题**：某些 section 一直无法达到字数要求
**解决**：
1. 检查 `.tool-generation/{keyword}/content-retry-*.json` 查看重试历史
2. 手动编辑 `content-final.json` 调整内容
3. 或临时禁用验证：`ENABLE_WORD_COUNT_VALIDATION=false`

**问题**：重新生成的内容质量不佳
**解决**：
1. 降低 `maxWordCountRetries` 到 1
2. 手动审核和编辑内容
3. 调整 prompt 要求（在 `regenerateSection()` 函数中）

### 页面检查问题

**问题**：服务器启动失败
**解决**：
1. 检查端口 3000 是否被占用：`lsof -i :3000`
2. 手动启动服务器：`pnpm dev`
3. 或更换端口：`DEV_SERVER_PORT=3001`

**问题**：页面检查超时
**解决**：
1. 增加超时时间（修改 `CONFIG.pageCheckTimeout`）
2. 确保项目可以正常构建：`pnpm build`
3. 手动访问页面检查问题

**问题**：页面显示 404
**解决**：
1. 检查 Phase 3 代码生成是否成功
2. 检查路由文件是否正确生成
3. 检查 `src/routes.ts` 是否更新

---

## 输出文件位置

```
.tool-generation/
└── {keyword}/
    ├── research.json           # Phase 1 调研结果
    ├── content-research.json   # Phase 2 内容调研
    ├── content.json            # Phase 4 原始内容
    ├── content-retry-1.json    # Phase 4.5 第一次重试
    ├── content-retry-2.json    # Phase 4.5 第二次重试
    └── content-final.json      # Phase 4.5 最终内容
```

---

## 常见日志信息

### 成功
```
✅ 所有 section 字数验证通过！
✅ ✓ 页面加载成功！
✅ ✓ 页面内容看起来正常
```

### 警告
```
⚠️  发现 3 个 section 字数不符合要求，开始重新生成...
⚠️  已达到最大重试次数 (2)，以下 section 仍不符合要求
⚠️  页面中检测到可能的错误标记
```

### 错误
```
❌ 重新生成 section 失败: API错误
❌ 开发服务器启动超时
❌ ✗ 页面未找到 (404)
```

---

## 最佳实践

1. **首次使用**：开启所有验证，确保质量
2. **调试阶段**：禁用验证以加快迭代速度
3. **生产部署**：必须开启所有验证
4. **批量生成**：考虑禁用页面检查（手动批量检查）
5. **内容质量**：重视字数验证的警告，手动审核内容

---

## 性能参考

| 阶段 | 无验证 | 有验证（无重试） | 有验证（2次重试） |
|------|--------|----------------|------------------|
| Phase 4.5 | 0秒 | 10秒 | 30秒+ |
| Phase 8.5 | 0秒 | 5-10秒 | 30-40秒（首次启动） |
| **总增加** | - | 15-20秒 | 60-70秒 |

---

## 相关命令

```bash
# 检查脚本语法
node --check scripts/auto-tool-generator.js

# 查看端口占用
lsof -i :3000

# 手动启动服务器
pnpm dev

# 查看生成的文件
ls -la .tool-generation/*/

# 清理旧的生成文件
rm -rf .tool-generation/*/content-retry-*.json
```

---

## 更多信息

详细文档：[AUTO-TOOL-GENERATOR-VALIDATION-FEATURES.md](./AUTO-TOOL-GENERATOR-VALIDATION-FEATURES.md)
