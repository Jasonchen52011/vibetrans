#!/bin/bash

# 加载 .env.local 环境变量并运行 TypeScript 脚本
# 使用方法: ./scripts/run-with-env.sh scripts/your-script.ts

set -a
source .env.local
set +a

pnpm tsx "$@"
