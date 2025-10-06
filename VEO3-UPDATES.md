# Google Veo 3 - Recent Updates & Fixes

## 更新日期
2025-10-03

## 修复的问题

### 1. RAI 内容过滤处理 ✅

**问题**: 当内容被 Google 的安全过滤器（Responsible AI）过滤时，返回 `raiMediaFilteredCount > 0`，但没有 `generatedSamples`，导致 `videoUrl` 为 `undefined`。

**解决方案**:
```typescript
// 检测 RAI 过滤
if (generateVideoResponse?.raiMediaFilteredCount > 0) {
  const reasons = generateVideoResponse.raiMediaFilteredReasons || [];
  return {
    taskId,
    status: 'failed',
    error: 'Content blocked by safety filters. Please try a different prompt or image.',
  };
}

// 检测缺失的视频 URL
if (!videoUrl) {
  return {
    taskId,
    status: 'failed',
    error: 'Video generation completed but no video URL returned',
  };
}
```

**代码位置**: `src/lib/veo.ts:171-194`

**触发条件**:
- 暴力、武器相关内容
- 成人/性相关内容
- 其他违反 Google AI 政策的内容

**用户体验**:
- 显示明确的错误消息
- 提示用户尝试不同的提示词或图片
- 不会显示为无限处理状态

---

### 2. 页面拖拽闪烁问题 ✅

**问题**: 拖拽图片到页面时，遮罩层频繁闪烁，影响用户体验。

**原因**:
- 子元素触发 `dragLeave` 事件
- 遮罩层本身干扰拖拽事件

**解决方案**:
```typescript
const dragCounter = useRef(0);

const handleDragEnter = (e: React.DragEvent) => {
  dragCounter.current++;
  if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
    setIsDragging(true);
  }
};

const handleDragLeave = (e: React.DragEvent) => {
  dragCounter.current--;
  if (dragCounter.current === 0) {
    setIsDragging(false);
  }
};
```

**关键改进**:
- 使用计数器跟踪进入/离开事件
- 遮罩层添加 `pointer-events-none`
- 只在计数器归零时隐藏遮罩

**代码位置**: `src/app/[locale]/(marketing)/video/page.tsx:201-248`

---

### 3. UI 简化 - 移除冗余标题 ✅

**问题**: "Configuration" 和 "Generation Mode" 标题占用空间且不必要。

**删除内容**:
1. ❌ "Configuration" 标题（带 Settings 图标）
2. ❌ "Generation Mode" 标签

**保留内容**:
- ✅ 模式切换按钮（Text to Video / Image to Video）
- ✅ 所有功能保持不变

**代码位置**: `src/app/[locale]/(marketing)/video/page.tsx:446-449`

---

### 4. 保留上传的图片 ✅

**问题**: 点击"Generate Video"后，上传的图片被清除，用户无法重复使用。

**之前的行为**:
```typescript
setVideoPrompt('');
setUploadedImageUrl(null);         // ❌ 清除图片
setUploadedImagePreview(null);     // ❌ 清除预览
setUploadedImageMimeType(null);    // ❌ 清除类型
```

**修改后的行为**:
```typescript
setVideoPrompt('');
// Keep uploaded image for reuse  ✅ 保留图片
```

**用户体验改进**:
- 可以用同一张图片生成多个视频
- 可以调整提示词重新生成
- 减少重复上传操作

**代码位置**: `src/app/[locale]/(marketing)/video/page.tsx:313-316`

---

## 测试用例

### 新增 RAI 过滤测试

**运行方式**:
```bash
node test-veo.mjs rai
```

**测试内容**:
1. 武器相关内容
2. 暴力场景
3. 成人内容

**预期结果**:
- 内容被过滤
- 返回明确的错误消息
- 不会无限等待

**示例输出**:
```
🧪 Testing RAI Content Filtering...

Testing prompt: "A person holding a weapon"
✅ Content was filtered as expected

Testing prompt: "Violence in a street scene"
✅ Content was filtered as expected

Testing prompt: "Explicit adult content"
✅ Content was filtered as expected
```

---

## API 响应示例

### 成功生成
```json
{
  "name": "models/veo-3.0-generate-001/operations/abc123",
  "done": true,
  "response": {
    "@type": "type.googleapis.com/...",
    "generateVideoResponse": {
      "generatedSamples": [
        {
          "video": {
            "uri": "https://generativelanguage.googleapis.com/..."
          }
        }
      ]
    }
  }
}
```

### 内容被过滤
```json
{
  "name": "models/veo-3.0-generate-001/operations/xyz789",
  "done": true,
  "response": {
    "@type": "type.googleapis.com/...",
    "generateVideoResponse": {
      "raiMediaFilteredCount": 1,
      "raiMediaFilteredReasons": ["SENSITIVE_CONTENT"]
    }
  }
}
```

---

## 全页面拖拽功能

### 使用方式
1. 切换到 "Image to Video" 模式
2. 从桌面拖动图片文件到浏览器窗口任意位置
3. 看到蓝色拖放提示遮罩
4. 释放鼠标完成上传

### 支持格式
- JPG / JPEG
- PNG
- WEBP

### 最大文件大小
10MB

### 视觉反馈
- 蓝色半透明背景
- 上传图标动画
- 清晰的提示文字

---

## 测试清单

### 功能测试
- [x] 文本转视频正常工作
- [x] 图片转视频正常工作
- [x] RAI 过滤正确处理
- [x] 拖拽上传无闪烁
- [x] 图片保留可重用
- [x] 错误消息清晰

### UI 测试
- [x] 标题已移除
- [x] 布局保持整洁
- [x] 拖拽遮罩显示正常
- [x] 暗色模式正常

### 边界测试
- [x] 大文件（接近 10MB）
- [x] 敏感内容提示词
- [x] 网络超时重试
- [x] 无图片 URL 处理

---

## 已知限制

1. **RAI 过滤规则**: 由 Google 控制，可能会误判
2. **视频保留时间**: 生成的视频只保留 2 天
3. **生成时间**: 通常 60-120 秒，取决于复杂度
4. **并发限制**: API 可能有速率限制

---

## 建议

### 给用户的提示
1. 避免使用敏感词汇
2. 使用描述性、具体的提示词
3. 图片内容应符合社区准则
4. 下载重要视频避免过期

### 开发建议
1. 考虑添加提示词建议功能
2. 可以添加内容预检查
3. 考虑缓存常用视频
4. 添加视频下载功能

---

## 更新文件列表

1. `src/lib/veo.ts` - RAI 过滤处理
2. `src/app/[locale]/(marketing)/video/page.tsx` - UI 改进
3. `test-veo.mjs` - 测试用例扩展
4. `VEO3-UPDATES.md` - 本文档

---

## 总结

✅ **所有问题已解决**
- RAI 过滤：正确处理和提示
- 拖拽闪烁：完全修复
- UI 简化：更加简洁
- 图片保留：提升体验

🎉 **系统状态：稳定可用**
