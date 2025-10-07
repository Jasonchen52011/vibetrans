# API Routes Runtime Configuration

This document explains the runtime configuration for all API routes in the VibeTrans application.

## Edge Runtime vs Node.js Runtime

Cloudflare Pages supports two runtime environments:
- **Edge Runtime**: Runs on Cloudflare's global edge network, fastest performance
- **Node.js Runtime**: Runs on Cloudflare Workers with Node.js compatibility layer

## Why Some Routes Need Node.js Runtime

Certain packages require Node.js-specific APIs that are not available in Edge Runtime:

1. **postgres** package - requires `vm` module and Node.js crypto APIs
2. **s3mini** package - requires `node:crypto` module
3. **Supabase realtime** - uses `process.versions` (warnings only, not blocking)

## Current Runtime Distribution

### Node.js Runtime Routes (6 routes)

These routes **MUST** use Node.js runtime because they depend on packages requiring Node.js APIs:

| Route | Reason | Package Dependency |
|-------|--------|-------------------|
| `/api/storage/upload` | S3 operations | s3mini → node:crypto |
| `/api/video/status` | Database access | postgres → vm module |
| `/api/video/generate` | Database access | postgres → vm module |
| `/api/image/generate` | Database access | postgres → vm module |
| `/api/distribute-credits` | Database access | postgres → vm module |
| `/api/webhooks/stripe` | Database + Stripe | postgres → vm module |

### Edge Runtime Routes (9 routes)

These routes can use Edge Runtime for optimal performance:

| Route | Purpose |
|-------|---------|
| `/api/video/proxy` | Video URL proxying |
| `/api/ping` | Health check |
| `/api/chat` | AI chat functionality |
| `/api/auth/callback` | Authentication callback |
| `/api/generate-images` | Image generation |
| `/api/dog-translator` | Dog language translation |
| `/api/analyze-content` | Content analysis |
| `/api/image/upload` | Image upload handling |
| `/api/search` | Search functionality |

## Migration Path

To maximize Edge Runtime usage in the future:

### Short-term (Current)
- ✅ Use Node.js runtime for database-dependent routes
- ✅ Use Edge runtime for all other routes

### Long-term Optimizations
1. **Replace postgres with Edge-compatible DB client**
   - Consider using Supabase client for database operations
   - Or use D1 (Cloudflare's edge database)

2. **Replace s3mini with Edge-compatible S3 client**
   - Migrate to `@aws-sdk/client-s3` with custom fetch adapter
   - Or use Cloudflare R2 bindings directly

3. **Minimize database calls in API routes**
   - Move database logic to server actions
   - Use caching strategies

## Performance Implications

| Runtime | Startup Time | Global Availability | Cost |
|---------|--------------|-------------------|------|
| Edge Runtime | < 10ms | 300+ cities | Lower |
| Node.js Runtime | ~100ms | Regional | Higher |

**Recommendation**: Keep as many routes as possible on Edge Runtime for best performance.

## Troubleshooting

### Error: "Module not found: Can't resolve 'vm'"
**Solution**: Change the route to `export const runtime = "nodejs";`

### Error: "A Node.js API is used (process.versions)"
**Solution**: This is usually just a warning from Supabase. It won't block deployment unless it's in an Edge runtime route that actually calls the code.

### Error: "Reading from 'node:crypto' is not handled"
**Solution**: Change the route to `export const runtime = "nodejs";`

## Last Updated
2025-10-07 - After Supabase Auth migration and Cloudflare Pages deployment
