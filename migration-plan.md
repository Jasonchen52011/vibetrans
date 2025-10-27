# 渐进式基座迁移方案

## 阶段1：核心翻译器基座化 (节省60-80KB)
- [x] japanese-to-english-translator
- [x] cantonese-translator
- [x] chinese-to-english-translator (节省10.9KB，63.8%)
- [ ] albanian-to-english-translator
- [ ] english-to-chinese-translator

## 阶段2：批量迁移小型翻译器 (节省100-120KB)
- [ ] ancient-greek-translator
- [ ] aramaic-translator
- [ ] esperanto-translator
- [ ] greek-translator
- [ ] middle-english-translator
- [ ] nahuatl-translator
- [ ] ogham-translator

## 阶段3：优化大型翻译器 (节省80-100KB)
- [ ] manga-translator (复杂，多个子路由)
- [ ] chinese-to-english-translator (17KB)
- [ ] 其他大于10KB的翻译器

## 预期效果
- 总节省空间：240-280KB
- 减少79%的翻译器代码重复
- 提高维护效率和代码一致性