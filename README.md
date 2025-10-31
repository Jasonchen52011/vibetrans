# VibeTrans

AI-powered media translation platform.

## Development

### Prerequisites

- Node.js 20+
- PostgreSQL database
- pnpm package manager

### Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp env.example .env
```

3. Configure your database and API keys in `.env`

4. Run database migrations:
```bash
pnpm db:migrate
```

5. Start the development server:
```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Deployment

This project is deployed on Cloudflare Pages with automatic deployments from the main branch.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter
- `pnpm format` - Format code
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio

## Tech Stack

- **Framework**: Next.js 15
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth
- **Payments**: Stripe
- **UI**: Radix UI + TailwindCSS
- **AI**: Multiple AI providers integration

## License

See [LICENSE](LICENSE) file for details.
