# 优化备份清单

## 优化前项目状态
- 原始大小: 13.67MB
- 目标大小: <10MB
- 需要减少: ~3.7MB

## 1. 暂时移除的翻译器页面 (32个)

### 低频翻译器 (12个) - 优先移除
- dog-translator
- baby-translator
- minion-translator
- alien-text-generator
- gibberish-translator
- gen-z-translator
- gen-alpha-translator
- bad-translator
- yoda-translator
- mandalorian-translator
- high-valyrian-translator
- drow-translator

### 中频翻译器 (20个) - 暂时移除
- ancient-greek-translator
- aramaic-translator
- baybayin-translator
- cantonese-translator
- cuneiform-translator
- esperanto-translator
- gaster-translator
- ivr-translator
- manga-translator
- middle-english-translator
- nahuatl-translator
- ogham-translator
- rune-translator
- runic-translator
- samoan-to-english-translator
- swahili-to-english-translator
- telugu-to-english-translator
- wingdings-translator
- pig-latin-translator
- creole-to-english-translator

## 2. 保留的核心翻译器 (15个)
- al-bhed-translator
- albanian-to-english
- chinese-to-english-translator
- english-to-chinese-translator
- english-to-polish-translator
- english-to-swahili-translator
- english-to-amharic-translator
- english-to-persian-translator
- greek-translator
- japanese-to-english-translator
- verbose-generator
- dumb-it-down-ai
- --help
- about
- privacy
- terms

## 3. 暂时移除的语音功能
- 所有transcribe API路由 (11个)
- speech-to-text API
- speech-transcribe API
- TTS API
- text-to-speech-button组件
- @google-cloud/text-to-speech依赖
- tone依赖

## 4. 暂时移除的其他依赖
- mammoth (文档转换)
- 部分@ai-sdk包 (保留核心的openai, google)

## 5. 移除的文件列表
### API路由
- src/app/api/*/transcribe/*
- src/app/api/speech-to-text/*
- src/app/api/speech-transcribe/*
- src/app/api/tts/*

### 页面组件
- src/app/[locale]/(marketing)/(pages)/[低频翻译器]/*
- 相关的message文件

### 恢复步骤
1. 从git历史恢复移除的文件
2. 重新安装移除的依赖
3. 恢复API路由和组件引用
4. 重新测试所有功能

## 预期效果
- 减少约4-5MB项目大小
- 保留核心翻译功能
- 移除语音和娱乐功能
- 项目大小降至10MB以下