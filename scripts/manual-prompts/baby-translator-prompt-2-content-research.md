# Prompt 2: 内容调研（使用 ChatGPT o1 或 o3）

我现在在为网站 VibeTrans (https://vibetrans.com/) 规划关键词「baby translator」工具落地页文案。

请帮我做以下调研：

1. 在 Google 搜索主关键词「baby translator」并分析排名前 15 的网站，它们有哪些话题没有写到，但是是搜索这个关键词的用户特别关心的问题，帮我列出这些话题

2. 在 Quora.com 和 Reddit.com 上查询「baby translator」相关的话题，找到高频提及和高投票的话题，帮我列出这些话题

3. 在 Quora.com、Reddit.com 和 Google 上查询「baby translator」相关的话题，找出一些 fun facts 并帮我列出这些话题

4. 在 Google 搜索主关键词「baby translator」并分析排名前 15 的网站，在页面文案上，哪些英文单词和短语出现的频率比较高，给我列出来前30个英文词汇（注意忽略掉介词、冠词等无意义的词汇）

请以 JSON 格式输出，格式如下：
```json
{
  "contentGaps": [
    {
      "topic": "话题标题",
      "reason": "为什么用户关心",
      "competitors": ["缺少此内容的竞品"]
    }
  ],
  "socialTopics": [
    {
      "platform": "Reddit/Quora",
      "topic": "话题",
      "engagement": "高/中",
      "summary": "摘要"
    }
  ],
  "funFacts": ["事实1", "事实2"],
  "highFrequencyWords": [
    {
      "word": "单词",
      "frequency": "高/中",
      "context": "使用场景"
    }
  ]
}
```

---

## 完成后

将 ChatGPT 返回的完整 JSON 复制保存，然后继续运行 Prompt 3。
