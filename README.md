# 🎬 Video生成SaaS应用

基于 **Next.js 15** 和 **Google Veo 3** 的专业视频生成平台，针对 **Cloudflare Pages** 优化部署。

## ✨ 核心功能

- 🎥 **AI视频生成** - 文字/图片转视频（Google Veo 3）
- 🔐 **多端认证** - 邮箱/GitHub/Google登录
- 💳 **订阅系统** - Stripe集成（月付/年付/终身）
- 🪙 **积分系统** - 按需付费模式
- 🌍 **国际化** - 中英文双语
- 📱 **响应式设计** - 完美适配各种设备

## 🚀 快速开始

### 1. 克隆并安装

```bash
git clone <your-repo>
cd video-template
pnpm install
```

### 2. 配置环境变量

复制 `.env.cloudflare.example` 为 `.env.local` 并填写必需的值：

```bash
cp .env.cloudflare.example .env.local
```

**最少配置**（立即开始开发）：
```env
DATABASE_URL=your_database_url
BETTER_AUTH_SECRET=your_secret_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

### 3. 运行开发环境

```bash
pnpm dev
```

访问 http://localhost:3000

### 4. 部署到Cloudflare Pages

**详细步骤请查看**:
- 📖 [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) - 完整部署指南
- ☑️ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 分步检查清单
- 📊 [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 项目状态
- 🎉 [交付总结.md](./交付总结.md) - 交付内容

**快速部署**:
```bash
# 通过CLI
pnpm run deploy:cf

# 或通过Dashboard
# https://dash.cloudflare.com/ → Workers & Pages → Create
```

## 📋 技术栈

- **Framework**: Next.js 15.2.1 (App Router)
- **Runtime**: Edge (Cloudflare Workers)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth (GitHub/Google/Email)
- **Payment**: Stripe
- **AI**: Google Veo 3
- **UI**: Radix UI + TailwindCSS
- **Language**: TypeScript

## 📂 项目结构

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API端点（Edge Runtime）
│   └── [locale]/    # 国际化路由
├── components/      # React组件
├── lib/            # 工具函数
├── config/         # 配置文件
└── db/             # 数据库Schema

content/            # MDX内容（博客/文档）
messages/           # 翻译文件
```

## 🎯 主要命令

```bash
pnpm dev              # 开发服务器
pnpm build            # 生产构建
pnpm build:cf         # Cloudflare Pages构建
pnpm deploy:cf        # 部署到Cloudflare

pnpm db:generate      # 生成数据库迁移
pnpm db:migrate       # 运行迁移
pnpm db:studio        # Drizzle Studio

pnpm lint             # 代码检查
pnpm format           # 格式化代码
```

## 🔧 环境变量

详细的环境变量说明请查看 `.env.cloudflare.example`

**必需**（14个）:
- 数据库连接
- Auth密钥
- Google Veo API
- Stripe密钥（7个）
- OAuth凭据

**推荐**（12个）:
- 存储服务（Cloudflare R2）
- 邮件服务（Resend）

**可选**（8个）:
- 分析工具
- Turnstile验证
- 客服聊天

## 📚 文档索引

| 文档 | 说明 |
|------|------|
| [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) | Cloudflare Pages部署完整指南 |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | 部署检查清单（逐步操作） |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | 当前项目状态和技术细节 |
| [交付总结.md](./交付总结.md) | 交付内容和快速开始 |
| [CLAUDE.md](./CLAUDE.md) | 项目架构说明 |
| [.env.cloudflare.example](./.env.cloudflare.example) | 环境变量模板 |

## ⚠️ 重要提醒

### 成本控制
- Google Veo 3: **$0.75/秒**（标准模式）
- 建议设置Google Cloud预算警报
- 监控API调用量

### 首次部署
1. 确保运行数据库迁移：`pnpm db:migrate`
2. 配置Stripe Webhook回调URL
3. 更新OAuth应用回调URL
4. 使用测试模式验证支付流程

## 🆘 常见问题

### 构建失败？
- 检查Node版本 >= 20
- 运行 `pnpm install` 确保依赖完整

### 500错误？
- 检查环境变量是否配置完整
- 查看Cloudflare部署日志

### Video生成失败？
- 验证 `GOOGLE_GENERATIVE_AI_API_KEY` 有效
- 确认Google Cloud计费已启用

**更多问题请查看**: [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) 常见问题部分

## 📞 支持

- 📖 查看文档：上方文档索引
- 🐛 提交Issue：GitHub Issues
- 💬 技术支持：查看交付文档中的联系方式

## 📊 项目状态

✅ **开发环境**: 已验证（2.1s启动）  
✅ **生产构建**: 已通过  
✅ **Edge Runtime**: 全部配置  
✅ **Bundle大小**: 符合限制  
✅ **部署就绪**: 可立即部署

**最后更新**: 2025-10-08  
**版本**: Video-Only v1.0

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE)

---

🎉 **开始构建你的视频生成平台吧！**
