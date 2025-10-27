# 🚀 翻译工具页面生成器

一键生成完整的翻译工具页面，包括页面组件、API路由和翻译模板。

---

## 📖 使用方法

### 基础用法

```bash
pnpm tool:create <tool-slug> "<Tool Name>"
```

### 参数说明

- `<tool-slug>`: URL路径，使用小写字母和连字符（例如：`emoji-translator`）
- `<Tool Name>`: 工具显示名称（例如：`"Emoji Translator"`）

---

## 🎯 示例

### 创建 Emoji Translator 工具

```bash
pnpm tool:create emoji-translator "Emoji Translator"
```

生成后会自动创建：

```
✅ src/app/[locale]/(marketing)/(pages)/emoji-translator/
   ├── page.tsx                      # 页面主文件
   └── EmojiTranslatorTool.tsx       # 工具组件

✅ src/app/api/emoji-translator/
   └── route.ts                      # API 路由（需要实现翻译逻辑）

📄 翻译文件模板（需要手动添加）
```

---

## 📋 完整工作流程

### Step 1: 生成页面

```bash
pnpm tool:create pirate-translator "Pirate Translator"
```

### Step 2: 添加翻译

将生成器输出的JSON模板复制到翻译文件：

**messages/en.json**
```json
{
  "PirateTranslatorPage": {
    "title": "Pirate Translator",
    "description": "...",
    // ... 其他字段
  }
}
```

**messages/zh.json**（翻译为中文）
```json
{
  "PirateTranslatorPage": {
    "title": "海盗翻译器",
    "description": "...",
    // ... 其他字段
  }
}
```

### Step 3: 实现API逻辑

编辑 `src/app/api/pirate-translator/route.ts`：

```typescript
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // 实现你的翻译逻辑
    const translated = await yourTranslationFunction(text);

    return NextResponse.json({ translated });
  } catch (error) {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
```

### Step 4: 准备图片资源

将图片放到 `public/images/docs/` 目录：

```
public/images/docs/
├── what-is-pirate-translator.webp      # What Is 区块图片
├── pirate-translator-how-to.webp       # How To 区块图片
├── pirate-translator-fact-1.webp       # Fun Fact 1 图片
└── pirate-translator-fact-2.webp       # Fun Fact 2 图片
```

### Step 5: 测试页面

```bash
pnpm dev
```

访问：`http://localhost:3000/pirate-translator`

### Step 6: Build 并上线

```bash
# 构建检查
pnpm build

# 确认没有错误后提交
git add .
git commit -m "feat: add pirate translator tool"
git push
```

---

## ✅ 检查清单

新增工具时，确保完成以下步骤：

- [ ] 运行生成器：`pnpm tool:create <slug> "<Name>"`
- [ ] 添加英文翻译到 `messages/en.json`
- [ ] 添加中文翻译到 `messages/zh.json`
- [ ] 实现API路由的翻译逻辑
- [ ] 准备4张图片资源（what-is, how-to, fact-1, fact-2）
- [ ] 运行 `pnpm dev` 本地测试
- [ ] 检查页面显示是否正常
- [ ] 测试翻译功能是否工作
- [ ] 运行 `pnpm build` 确保构建成功
- [ ] 检查 JSON 字段是否正确引用
- [ ] 提交代码并推送

---

## 🎨 自定义生成的页面

生成后，你可以自定义以下内容：

### 1. 修改页面布局

编辑 `page.tsx`，调整区块顺序或添加新区块：

```tsx
return (
  <>
    <HeroSection />
    <ToolComponent />
    <WhatIsSection />
    <ExamplesSection />
    {/* 添加自定义区块 */}
    <CustomSection />
    <HowToSection />
    {/* ... */}
  </>
);
```

### 2. 添加工具特定配置

如果需要迭代次数、样式选择器等，参考 `BadTranslatorTool` 组件：

```tsx
const [iterations, setIterations] = useState<number>(5);
const [style, setStyle] = useState<'humor' | 'absurd'>('humor');

// 在工具组件中添加选择器UI
<select value={iterations} onChange={(e) => setIterations(Number(e.target.value))}>
  <option value={5}>5 times</option>
  <option value={10}>10 times</option>
</select>
```

### 3. 自定义示例数据

修改 `examplesData` 对象：

```tsx
const examplesData = {
  title: 'Translation Examples',
  description: 'Real examples of translations',
  images: [
    { alt: 'Hello → Ahoy', name: 'Hello → Ahoy' },
    { alt: 'Friend → Matey', name: 'Friend → Matey' },
    // ... 添加更多示例
  ],
};
```

---

## 🔧 高级技巧

### 使用 AI 翻译

如果使用 AI API（如 OpenAI），参考以下模式：

```typescript
// src/app/api/pirate-translator/route.ts
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: Request) {
  const { text } = await request.json();

  const { text: translated } = await generateText({
    model: openai('gpt-4'),
    prompt: `Translate the following text to pirate speak: ${text}`,
  });

  return NextResponse.json({ translated });
}
```

### 添加速率限制

```typescript
import { ratelimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // ... 翻译逻辑
}
```

---

## 📊 时间对比

| 任务 | 手动创建 | 使用生成器 |
|------|---------|-----------|
| 创建页面文件 | 30分钟 | 30秒 |
| 创建工具组件 | 45分钟 | 30秒 |
| 创建API路由 | 15分钟 | 30秒 |
| 准备翻译模板 | 20分钟 | 2分钟（复制粘贴） |
| **总计** | **~110分钟** | **~4分钟** |

**提速约 27倍！** 🚀

---

## ❓ 常见问题

### Q: 生成后页面报错怎么办？

**A:** 确保你已经：
1. 添加了翻译文件到 `messages/en.json` 和 `messages/zh.json`
2. 准备了所需的图片资源
3. 运行了 `pnpm dev` 重启服务器

### Q: 如何删除已生成的工具？

**A:** 手动删除以下文件夹：
```bash
rm -rf src/app/[locale]/(marketing)/(pages)/your-tool
rm -rf src/app/api/your-tool
```

然后从 `messages/en.json` 和 `messages/zh.json` 中删除对应的翻译字段。

### Q: 生成器支持其他类型的工具吗？

**A:** 当前版本专为翻译工具优化。如果需要其他类型（如图片生成器），可以：
1. 修改 `scripts/create-translator-tool.js` 模板
2. 或者使用生成器创建基础结构，然后手动调整

### Q: 翻译字段太多了，能简化吗？

**A:** 翻译模板是标准化的，包含了所有常用区块。你可以：
- 删除不需要的区块（如 Fun Facts）
- 在 `page.tsx` 中注释掉对应的组件

---

## 🎯 最佳实践

1. **统一命名规范**：工具名称使用连字符（`emoji-translator`），不用下划线
2. **翻译一致性**：保持所有工具的翻译字段结构一致
3. **图片优化**：使用 WebP 格式，建议尺寸 1200x630
4. **API 错误处理**：始终返回有意义的错误消息
5. **类型安全**：尽量减少 `@ts-ignore` 的使用

---

## 🚀 下一步优化

未来可以考虑：

- [ ] 支持交互式CLI（选择工具类型、自动生成图片描述）
- [ ] 自动生成图片（使用AI图片生成）
- [ ] 自动生成翻译（使用AI翻译）
- [ ] 支持更多工具类型模板（图片生成器、文本转换器等）
- [ ] 集成到 VS Code 扩展

---

## 💡 反馈与建议

如果你有任何改进建议，欢迎：
1. 直接修改 `scripts/create-translator-tool.js`
2. 更新此文档
3. 分享给团队成员

Happy coding! 🎉
