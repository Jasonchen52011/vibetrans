# Google Cloud Text-to-Speech 设置指南

## 为什么选择 Google Cloud TTS？

✅ **每月免费额度**：
- WaveNet voices: 100万字符/月 免费
- Standard voices: 400万字符/月 免费
- 新用户额外获得 $300 免费credit

✅ **高质量语音**：
- 380+ 声音，支持75+ 语言
- 支持 pitch、speed 调整
- WaveNet/Neural2 音质接近真人

✅ **完美适合小黄人**：
- 可以调整 pitch 到 +20 semitones（极高音）
- 可以调整 speaking rate 到 4.0x（超快）
- 非常适合模拟小黄人声音

## 设置步骤

### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 "Cloud Text-to-Speech API"

### 2. 创建服务账号密钥

1. 进入 "IAM & Admin" > "Service Accounts"
2. 创建服务账号
3. 授予 "Cloud Text-to-Speech User" 角色
4. 创建 JSON 密钥文件并下载

### 3. 配置环境变量

在 `.env.local` 文件中添加：

\`\`\`bash
# Google Cloud TTS 配置
GOOGLE_CLOUD_CREDENTIALS=/path/to/your/service-account-key.json
# 或者直接使用JSON内容
GOOGLE_CLOUD_CREDENTIALS_JSON='{"type":"service_account","project_id":"your-project",...}'
\`\`\`

### 4. 使用代码

API 端点已创建在 \`src/app/api/google-tts/route.ts\`

前端调用方式：
\`\`\`typescript
const response = await fetch('/api/google-tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'hello I love bananas',
    tone: 'cute', // cute | evil | excited
  }),
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
await audio.play();
\`\`\`

## 小黄人语音参数

| 语气 | Voice | Pitch | Rate | 效果 |
|------|-------|-------|------|------|
| Cute | en-US-Wavenet-C (女) | +10st | 1.5x | 高音可爱 |
| Evil | en-US-Wavenet-D (男) | -5st | 0.75x | 低沉威胁 |
| Excited | en-GB-Wavenet-A (女) | +15st | 1.8x | 超兴奋 |

## 费用估算

假设每天1000个翻译请求，每个50字符：
- 每月使用：1000 × 30 × 50 = 150万字符
- 费用：完全免费（在100万免费额度内）

## 备选方案

如果不想设置 Google Cloud：

1. **OpenAI TTS** - $15/100万字符，音质极佳
2. **ElevenLabs** - 免费10k字符/月，然后$5/月
3. **Azure Speech** - 免费50万字符/月
4. **继续使用浏览器TTS** - 完全免费但音质一般

## 下一步

1. 完成 Google Cloud 设置
2. 将密钥文件路径添加到 `.env.local`
3. 重启开发服务器
4. 测试 `/minion-translator` 页面
