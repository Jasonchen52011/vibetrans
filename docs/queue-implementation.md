# Gemini API Queue Implementation

## 概述

成功实现了 Google Generative AI API 的队列管理系统，用于控制并发请求、提供重试机制和统计跟踪。

## 实现的功能

### 1. 队列管理器 (`src/lib/queue/gemini-queue-manager.ts`)
- **并发控制**: 默认限制为 5 个并发请求
- **自动重试**: 失败请求自动重试，最多 3 次
- **指数退避**: 重试延迟逐渐增加
- **超时保护**: 每个请求 30 秒超时
- **统计跟踪**: 实时跟踪处理数量、失败率、平均时间

### 2. 集成点

#### `gemini-translator-base.ts`
- 文本翻译通过队列
- 图片翻译通过队列
- 音频翻译通过队列
- 健康检查通过队列

#### `base-translator.ts`
- AI SDK 调用通过队列
- 所有翻译请求队列化

#### `gemini-translate` API 路由
- API 端点使用队列
- 返回队列统计信息

### 3. 监控 API (`/api/queue-stats`)
```json
{
  "queue": {
    "activeCount": 5,
    "pendingCount": 10,
    "totalProcessed": 100,
    "totalFailed": 2,
    "averageProcessingTime": 750
  },
  "health": {
    "status": "healthy",
    "successRate": 98
  }
}
```

## 测试结果

### 性能测试
- ✅ **单请求**: 正常工作，平均 1.4 秒
- ✅ **10 并发请求**: 队列正确限制为 5 个并发，总时间 1.9 秒
- ✅ **30 高负载请求**: 吞吐量 5.9 req/s，无失败
- ✅ **重试机制**: 配置正确，自动重试失败请求

### 队列行为
- 正确限制并发数为 5
- 超出限制的请求进入等待队列
- 请求按顺序处理
- 失败自动重试，最多 3 次

## 使用方式

### 1. 基础使用
```typescript
import { getGeminiQueueManager } from '@/lib/queue/gemini-queue-manager';

const queueManager = getGeminiQueueManager();
const result = await queueManager.enqueue(
  () => model.generateContent(prompt),
  'task-name'
);
```

### 2. 自定义配置
```typescript
const queueManager = getGeminiQueueManager({
  concurrency: 3,        // 最大并发数
  retryAttempts: 5,      // 重试次数
  retryDelay: 2000,      // 重试延迟(ms)
  timeout: 60000         // 超时时间(ms)
});
```

### 3. 获取统计
```typescript
const stats = queueManager.getStats();
console.log(`Active: ${stats.activeCount}`);
console.log(`Pending: ${stats.pendingCount}`);
console.log(`Processed: ${stats.totalProcessed}`);
```

## 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `concurrency` | 5 | 最大并发请求数 |
| `retryAttempts` | 3 | 失败重试次数 |
| `retryDelay` | 1000ms | 基础重试延迟 |
| `timeout` | 30000ms | 请求超时时间 |

## 优势

1. **防止 Rate Limit**: 控制并发，避免触发 API 限制
2. **提高可靠性**: 自动重试，减少临时失败
3. **优化吞吐量**: 最大化利用 API 配额
4. **实时监控**: 了解 API 使用情况
5. **用户体验**: 请求排队而非直接失败

## 测试脚本

- `scripts/test-gemini-queue.ts` - 完整功能测试
- `scripts/test-queue-simple.ts` - 简化集成测试
- `scripts/test-api-queue.ts` - API 端点测试
- `scripts/demo-queue-system.ts` - 演示脚本

## 监控

访问 `/api/queue-stats` 获取实时队列状态：

```bash
curl http://localhost:3000/api/queue-stats
```

## 注意事项

1. 队列管理器是单例模式，全局共享
2. 统计信息保留最近 100 次请求的处理时间
3. Rate limit 错误会触发更长的重试延迟
4. 开发环境会输出详细日志

## 后续优化建议

1. 添加请求优先级
2. 实现请求去重
3. 添加缓存机制
4. 支持动态调整并发数
5. 添加 Prometheus 指标导出