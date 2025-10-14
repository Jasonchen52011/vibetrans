# 验证功能测试清单

## 测试前准备

- [ ] 确保已设置 `OPENAI_API_KEY` 环境变量
- [ ] 确保端口 3000 未被占用（或设置 `DEV_SERVER_PORT`）
- [ ] 备份重要数据（可选）

---

## 测试 1: 完整流程测试（所有功能开启）

### 命令
```bash
node scripts/auto-tool-generator.js "test translator"
```

### 验证点
- [ ] Phase 4.5 运行
  - [ ] 显示 "开始验证字数..."
  - [ ] 如有不合格 section，显示重新生成日志
  - [ ] 最终显示 "所有 section 字数验证通过"
  - [ ] 生成 `content-final.json` 文件

- [ ] Phase 8.5 运行
  - [ ] 检查端口状态
  - [ ] 启动或检测到开发服务器
  - [ ] 访问页面并显示状态码
  - [ ] 显示页面检查结果

- [ ] 生成的文件
  - [ ] `.tool-generation/test-translator/content.json` 存在
  - [ ] `.tool-generation/test-translator/content-final.json` 存在
  - [ ] 如有重试：`content-retry-*.json` 存在

### 预期输出
```
============================================================
📍 Phase 4.5: 字数验证和重新生成
============================================================
ℹ️  开始验证字数...
✅ 所有 section 字数验证通过！
✅ 最终内容已保存到: .tool-generation/test-translator/content-final.json

============================================================
📍 Phase 8.5: 页面错误自动检查
============================================================
ℹ️  检查端口 3000 是否有服务运行...
✅ ✓ 页面加载成功！
✅ ✓ 页面内容看起来正常
```

---

## 测试 2: 禁用字数验证

### 命令
```bash
ENABLE_WORD_COUNT_VALIDATION=false node scripts/auto-tool-generator.js "test translator 2"
```

### 验证点
- [ ] 不显示 Phase 4.5 相关日志
- [ ] 显示 "字数验证已禁用，跳过 Phase 4.5"
- [ ] Phase 8.5 正常运行
- [ ] 不生成 `content-retry-*.json` 文件
- [ ] 不生成 `content-final.json` 文件（只有 `content.json`）

### 预期输出
```
ℹ️  字数验证已禁用，跳过 Phase 4.5
```

---

## 测试 3: 禁用页面检查

### 命令
```bash
ENABLE_PAGE_ERROR_CHECK=false node scripts/auto-tool-generator.js "test translator 3"
```

### 验证点
- [ ] Phase 4.5 正常运行
- [ ] 不显示 Phase 8.5 相关日志
- [ ] 显示 "页面错误检查已禁用，跳过 Phase 8.5"
- [ ] 不启动开发服务器
- [ ] 不访问页面

### 预期输出
```
ℹ️  页面错误检查已禁用，跳过 Phase 8.5
```

---

## 测试 4: 全部禁用

### 命令
```bash
ENABLE_WORD_COUNT_VALIDATION=false ENABLE_PAGE_ERROR_CHECK=false node scripts/auto-tool-generator.js "test translator 4"
```

### 验证点
- [ ] Phase 4 之后直接进入 Phase 5
- [ ] Phase 7 之后直接完成
- [ ] 显示两个跳过信息
- [ ] 生成速度明显加快

---

## 测试 5: 字数验证 - 强制重新生成

为了测试重新生成功能，需要手动修改代码或创建一个测试用例：

### 方法 1：临时修改验证规则
在 `validateWordCounts()` 函数中临时将范围缩小：

```javascript
// 临时修改（测试后恢复）
heroDescription: {
  path: 'heroDescription.wordCount',
  min: 35,  // 改为 35
  max: 35,  // 改为 35（强制不合格）
  name: 'Hero描述'
},
```

### 验证点
- [ ] 检测到不合格的 section
- [ ] 显示 "发现 N 个 section 字数不符合要求"
- [ ] 调用 OpenAI API 重新生成
- [ ] 生成 `content-retry-1.json`
- [ ] 如还不合格，继续重试
- [ ] 达到最大重试次数后显示警告

### 预期输出
```
⚠️  发现 1 个 section 字数不符合要求，开始重新生成...
ℹ️  重新生成: Hero描述 (当前字数: 38, 期望: 35-35)
ℹ️  调用 gpt-4o API...
✅ ✓ Hero描述 已重新生成
ℹ️  重试 1 的内容已保存到: .tool-generation/.../content-retry-1.json
```

---

## 测试 6: 页面检查 - 服务器未运行

### 前提
确保端口 3000 没有运行任何服务：
```bash
lsof -i :3000  # 应该没有输出
```

### 命令
```bash
node scripts/auto-tool-generator.js "test translator 6"
```

### 验证点
- [ ] 检测到服务器未运行
- [ ] 显示 "开发服务器未运行，正在启动..."
- [ ] 启动 `pnpm dev`
- [ ] 等待服务器就绪
- [ ] 显示 "开发服务器已就绪"
- [ ] 成功访问页面
- [ ] 提示手动停止服务器

### 预期输出
```
ℹ️  检查端口 3000 是否有服务运行...
ℹ️  开发服务器未运行，正在启动...
ℹ️  等待服务器启动（最多 30 秒）...
ℹ️  开发服务器已启动
✅ 开发服务器已就绪
ℹ️  正在访问页面: http://localhost:3000/test-translator-6
✅ ✓ 页面加载成功！
⚠️  请手动停止开发服务器（Ctrl+C）或保持运行以便测试
```

---

## 测试 7: 页面检查 - 服务器已运行

### 前提
先手动启动服务器：
```bash
pnpm dev
```

### 命令
```bash
node scripts/auto-tool-generator.js "test translator 7"
```

### 验证点
- [ ] 检测到服务器已运行
- [ ] 显示 "开发服务器已在运行"
- [ ] 不启动新的服务器进程
- [ ] 直接访问页面
- [ ] 不提示停止服务器

### 预期输出
```
ℹ️  检查端口 3000 是否有服务运行...
ℹ️  开发服务器已在运行
ℹ️  正在访问页面: http://localhost:3000/test-translator-7
✅ ✓ 页面加载成功！
```

---

## 测试 8: 页面检查 - 页面不存在（404）

### 方法
手动删除生成的页面文件，或使用不存在的工具名称：

```bash
# 假设 nonexistent-tool 从未生成过
ENABLE_WORD_COUNT_VALIDATION=false node scripts/auto-tool-generator.js "nonexistent tool"
```

### 验证点
- [ ] 访问页面返回 404
- [ ] 显示 "✗ 页面未找到 (404)"
- [ ] 提示检查路由配置
- [ ] 返回失败状态

### 预期输出
```
ℹ️  HTTP 状态码: 404
❌ ✗ 页面未找到 (404)
⚠️  请检查路由配置是否正确
⚠️  页面检查发现问题：
   页面未找到
```

---

## 测试 9: 更换端口

### 命令
```bash
DEV_SERVER_PORT=3001 node scripts/auto-tool-generator.js "test translator 9"
```

### 验证点
- [ ] 显示 "检查端口 3001 是否有服务运行..."
- [ ] 在端口 3001 启动服务器（如需要）
- [ ] 访问 `http://localhost:3001/test-translator-9`

---

## 测试 10: 性能测试

### 对比测试
运行三次相同的命令，对比时间：

```bash
# 1. 无验证
time (ENABLE_WORD_COUNT_VALIDATION=false ENABLE_PAGE_ERROR_CHECK=false \
  node scripts/auto-tool-generator.js "perf test 1")

# 2. 仅字数验证
time (ENABLE_PAGE_ERROR_CHECK=false \
  node scripts/auto-tool-generator.js "perf test 2")

# 3. 全部验证
time node scripts/auto-tool-generator.js "perf test 3"
```

### 验证点
- [ ] 记录每次执行时间
- [ ] 验证时间差异符合预期（见文档中的性能参考）

---

## 测试后清理

```bash
# 清理测试生成的文件
rm -rf .tool-generation/test-translator*
rm -rf .tool-generation/perf-test*
rm -rf src/app/\[locale\]/\(marketing\)/\(pages\)/test-translator*
rm -rf src/app/api/test-translator*
rm -rf messages/pages/test-translator*

# 或手动删除相关文件
```

---

## 回归测试

运行现有工具生成，确保不破坏原有功能：

```bash
# 使用已知可用的关键词
node scripts/auto-tool-generator.js "emoji translator"
```

### 验证点
- [ ] 所有 Phase 正常执行
- [ ] 没有新的错误或警告
- [ ] 生成的文件结构正确
- [ ] 页面可以正常访问

---

## 边界测试

### 测试超长内容
创建一个内容特别长的测试用例，验证字数验证的上限检查。

### 测试空内容
验证当某些 section 缺失时的处理。

### 测试 API 失败
临时使用无效的 API Key，测试错误处理。

---

## 测试报告模板

```
测试日期：____________________
测试人员：____________________
环境信息：
  - Node.js 版本：____________
  - 操作系统：______________
  - 分支：_________________

| 测试编号 | 测试项 | 结果 | 备注 |
|---------|--------|------|------|
| 1 | 完整流程 | ✅ / ❌ | |
| 2 | 禁用字数验证 | ✅ / ❌ | |
| 3 | 禁用页面检查 | ✅ / ❌ | |
| 4 | 全部禁用 | ✅ / ❌ | |
| 5 | 字数验证重新生成 | ✅ / ❌ | |
| 6 | 服务器未运行 | ✅ / ❌ | |
| 7 | 服务器已运行 | ✅ / ❌ | |
| 8 | 页面404 | ✅ / ❌ | |
| 9 | 更换端口 | ✅ / ❌ | |
| 10 | 性能测试 | ✅ / ❌ | |

发现的问题：
1. _______________________________
2. _______________________________
3. _______________________________

改进建议：
1. _______________________________
2. _______________________________
3. _______________________________
```

---

## 自动化测试脚本（可选）

创建一个简单的测试脚本：

```bash
#!/bin/bash
# test-validation-features.sh

set -e

echo "开始测试验证功能..."

# 测试 1: 完整流程
echo "测试 1: 完整流程"
node scripts/auto-tool-generator.js "test-1" 2>&1 | grep "Phase 4.5" > /dev/null && echo "✅ 通过" || echo "❌ 失败"

# 测试 2: 禁用字数验证
echo "测试 2: 禁用字数验证"
ENABLE_WORD_COUNT_VALIDATION=false node scripts/auto-tool-generator.js "test-2" 2>&1 | grep "字数验证已禁用" > /dev/null && echo "✅ 通过" || echo "❌ 失败"

# 测试 3: 禁用页面检查
echo "测试 3: 禁用页面检查"
ENABLE_PAGE_ERROR_CHECK=false node scripts/auto-tool-generator.js "test-3" 2>&1 | grep "页面错误检查已禁用" > /dev/null && echo "✅ 通过" || echo "❌ 失败"

echo "测试完成！"
```

---

## 常见问题

**Q: 如何跳过某个特定的 section 验证？**
A: 需要修改 `validateWordCounts()` 函数，注释掉相应的验证代码。

**Q: 如何调整字数验证的容忍度？**
A: 修改 `validateWordCounts()` 中的 `validationRules` 对象的 `min` 和 `max` 值。

**Q: 页面检查一直超时怎么办？**
A: 增加 `CONFIG.pageCheckTimeout` 的值，或禁用页面检查功能。

**Q: 如何查看详细的调试日志？**
A: 在脚本中添加更多 `logInfo()` 调用，或使用 `console.log()` 输出详细信息。

---

## 测试完成后

- [ ] 清理测试生成的文件
- [ ] 恢复任何临时修改的代码
- [ ] 记录测试结果
- [ ] 提交测试报告（如需要）
- [ ] 更新文档（如发现问题或改进点）
