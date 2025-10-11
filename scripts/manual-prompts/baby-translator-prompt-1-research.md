# Prompt 1: 产品调研（使用 ChatGPT o1 或 o3）

请帮我做产品调研，使用英文搜索，中文回答我，补充上去的内容用英文：

1. 在 Google 搜索主关键词：「baby translator」
   分析排名前 15 的网站，对应给我工具介绍，独特亮点，通过表格展现给我。

2. 在 Quora.com 和 Reddit.com 上查询「baby translator」相关的话题，找到高频提及和高投票的话题，帮我列出这些话题

3. 在 Quora.com、Reddit.com 和 Google 上查询「baby translator」相关的话题，找出一些 fun facts 并帮我列出这些话题

4. 帮我总结刚收集的话题，分析市场空白的功能，给出可以加到这个工具里的建议，并给出原因和话题案例。

5. 根据收集的信息分析总结这个工具的产品规划，使用场景，产品名称（直接用关键词转为标题格式）。包含：
   - 一句话产品介绍
   - 亮点功能（分为两部分）：
     * 竞争对手的功能（我都要有）
     * 市场空白功能（创新点）

6. 使用ASCII画出完整方案，核心保持左边输入，右边输出。支持在输入框里粘贴或输入数据，上传 .txt 和 word 文件输入数据。右边支持复制数据，和下载数据。

7. 帮我排除的项目：不支持对外api对接，web端以外的形态，社交分享，历史记录。

8. 基本支持功能：上传文件txt,docx，上传清空。对结果txt下载，对结果复制，语音输入，语音输出。

请以 JSON 格式输出调研结果，格式如下：
```json
{
  "keyword": "baby translator",
  "productName": "产品名称",
  "description": "一句话产品介绍",
  "competitors": [
    {
      "name": "竞品名称",
      "url": "网址",
      "features": ["特点1", "特点2"]
    }
  ],
  "socialTopics": [
    {
      "platform": "Reddit/Quora",
      "topic": "话题标题",
      "votes": 100,
      "summary": "话题摘要"
    }
  ],
  "funFacts": [
    "趣味事实1",
    "趣味事实2"
  ],
  "features": {
    "basic": ["基本功能1", "基本功能2"],
    "competitive": ["竞品功能1", "竞品功能2"],
    "innovative": ["创新功能1", "创新功能2"]
  },
  "useCases": ["使用场景1", "使用场景2"],
  "asciiDesign": "ASCII 设计图"
}
```

---

## 完成后

将 ChatGPT 返回的完整 JSON 复制保存，然后继续运行 Prompt 2。
