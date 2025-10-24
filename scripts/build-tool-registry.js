#!/usr/bin/env node

/**
 * 工具注册表生成脚本
 *
 * 扫描 src/app/api 下的翻译工具路由，提取核心元数据并输出统一 JSON，
 * 方便 auto-tool-generator 等脚本快速检索现有实现。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT_DIR, 'src', 'app', 'api');
const PAGE_DIR = path.join(
  ROOT_DIR,
  'src',
  'app',
  '[locale]',
  '(marketing)',
  '(pages)'
);
const MESSAGES_DIR = path.join(ROOT_DIR, 'messages', 'pages');
const OUTPUT_DIR = path.join(ROOT_DIR, '.tool-generation');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'tool-registry.json');

function log(message) {
  console.log(message);
}

function toRelative(filePath) {
  return path.relative(ROOT_DIR, filePath);
}

function extractRuntime(source) {
  const match = source.match(/export\s+const\s+runtime\s*=\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function extractSupportedDirections(source) {
  const match = source.match(/supported[_-]directions\s*:\s*\[([^\]]*)\]/i);
  if (!match) return [];

  const content = match[1];
  const values = Array.from(content.matchAll(/['"]([^'"]+)['"]/g)).map(
    (result) => result[1]
  );
  return Array.from(new Set(values));
}

function extractMaxLength(source) {
  const match = source.match(/max(?:Length|_length)\s*:\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function extractModelNames(source) {
  const modelMatches = Array.from(
    source.matchAll(/model\s*:\s*([a-zA-Z0-9_.'()"[\]-]+)/g)
  );
  if (modelMatches.length === 0) return [];

  const cleaned = modelMatches.map((m) =>
    m[1]
      .replace(/google\((['"])([^'"]+)\1\)/, '$2')
      .replace(/['"`]/g, '')
      .trim()
  );
  return Array.from(new Set(cleaned.filter(Boolean)));
}

function detectFeatureFlags(source) {
  return {
    autoLanguageDetection: /detectLanguage/.test(source),
    usesFileUpload: /formData|file/i.test(source),
    hasVoiceSupport: /speech|audio|voice/i.test(source),
    usesStreaming: /StreamingTextResponse|ReadableStream/.test(source),
    mentionsRateLimit: /rate\s*limit/i.test(source),
  };
}

function extractHttpMethods(source) {
  const methods = new Set();
  const methodRegex =
    /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)/g;
  let match;
  while ((match = methodRegex.exec(source)) !== null) {
    methods.add(match[1]);
  }
  return Array.from(methods);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readApiDirectories() {
  const entries = await fs.readdir(API_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

async function parseApiRoute(slug) {
  const routePath = path.join(API_DIR, slug, 'route.ts');
  const warnings = [];

  if (!(await fileExists(routePath))) {
    warnings.push('route.ts 缺失');
    return {
      slug,
      warnings,
    };
  }

  const source = await fs.readFile(routePath, 'utf-8');

  const runtime = extractRuntime(source);
  if (!runtime) {
    warnings.push('未声明 runtime');
  }

  const supportedDirections = extractSupportedDirections(source);
  if (supportedDirections.length === 0) {
    warnings.push('未检测到 supported_directions');
  }

  const maxLength = extractMaxLength(source);
  if (!maxLength) {
    warnings.push('未检测到 maxLength');
  }

  const models = extractModelNames(source);
  if (models.length === 0) {
    warnings.push('未检测到模型配置');
  }

  const featureFlags = detectFeatureFlags(source);
  const httpMethods = extractHttpMethods(source);

  return {
    slug,
    runtime,
    httpMethods,
    supportedDirections,
    maxLength,
    models,
    featureFlags,
    warnings,
    routes: {
      api: toRelative(routePath),
    },
  };
}

async function enrichWithFilesystem(meta) {
  const slug = meta.slug;
  const pagePath = path.join(PAGE_DIR, slug);
  const messagesPath = path.join(MESSAGES_DIR, slug, 'en.json');

  const hasPage = await fileExists(path.join(pagePath, 'page.tsx'));
  const hasMessages = await fileExists(messagesPath);

  if (!meta.routes) meta.routes = {};
  meta.routes.page = hasPage
    ? toRelative(path.join(pagePath, 'page.tsx'))
    : null;
  meta.routes.toolComponent = hasPage
    ? await detectToolComponent(pagePath)
    : null;
  meta.routes.messages = hasMessages ? toRelative(messagesPath) : null;

  if (!hasPage) {
    meta.warnings.push('缺少页面文件');
  }
  if (!hasMessages) {
    meta.warnings.push('缺少英文文案');
  }

  return meta;
}

async function detectToolComponent(pagePath) {
  try {
    const files = await fs.readdir(pagePath);
    const toolFile = files.find((f) => f.endsWith('Tool.tsx'));
    return toolFile ? toRelative(path.join(pagePath, toolFile)) : null;
  } catch {
    return null;
  }
}

async function buildRegistry() {
  log('🔍 开始扫描 API 目录...');
  const slugs = await readApiDirectories();

  const registryEntries = [];
  for (const slug of slugs.sort()) {
    const meta = await parseApiRoute(slug);
    const enrichedMeta = await enrichWithFilesystem(meta);
    registryEntries.push(enrichedMeta);
  }

  const registry = {
    generatedAt: new Date().toISOString(),
    apiCount: registryEntries.length,
    tools: registryEntries,
  };

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(registry, null, 2), 'utf-8');

  log('✅ 工具注册表生成完成');
  log(`📄 输出文件: ${toRelative(OUTPUT_PATH)}`);
  log(`📊 共收录 API 工具: ${registryEntries.length}`);
}

buildRegistry().catch((error) => {
  console.error('❌ 生成工具注册表失败:', error);
  process.exit(1);
});
