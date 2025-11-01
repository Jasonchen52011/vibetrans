# Server文件22MB问题解决方案

## 问题总结
- **现象**：每个翻译器页面文件22MB (应该是~600KB)
- **原因**：webpack将所有104个翻译文件打包到每个页面中
- **根本**：Edge Runtime + next-intl + webpack静态分析的组合问题

## 解决方案层次

### 方案1：翻译内容分层 (推荐)
- **轻量级翻译**：仅包含页面核心字段 (title, hero, tool)
- **SEO内容分离**：将whatIs, examples, faqs等移到独立API
- **预期效果**：减少90%文件大小

### 方案2：Edge Runtime优化
- **切换到Node.js Runtime**：移除 `export const runtime = 'edge'`
- **实现真正的动态加载**：使用服务器端动态导入
- **权衡**：牺牲Edge性能换取bundle大小

### 方案3：外部化翻译文件
- **webpack externals配置**：将翻译文件排除在bundle外
- **运行时读取**：通过文件系统或API动态加载
- **复杂度**：需要自定义翻译加载机制

## 实施策略
1. 立即实施方案1 (最小风险)
2. 评估方案2 (性能权衡)
3. 长期考虑方案3 (架构重构)

## 关键提醒
- 翻译文件设计过于庞大是根本问题
- Edge Runtime限制了动态加载可能性
- webpack打包策略需要针对性优化