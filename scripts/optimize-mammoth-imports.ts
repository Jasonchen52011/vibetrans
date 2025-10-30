import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

interface FileInfo {
  path: string;
  content: string;
  hasMammothImport: boolean;
  hasReadFileContentFunction: boolean;
}

async function findFilesWithMammoth(): Promise<string[]> {
  const files = await glob('src/**/*{.ts,.tsx}', {
    ignore: ['**/node_modules/**', '**/.next/**'],
  });

  const filesWithMammoth: string[] = [];

  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      if (
        content.includes('import mammoth') ||
        content.includes("from 'mammoth'")
      ) {
        filesWithMammoth.push(file);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error reading file ${file}:`, error);
      }
    }
  }

  return filesWithMammoth;
}

function optimizeFile(content: string): string {
  // Replace mammoth import
  let optimizedContent = content.replace(
    /import mammoth from ['"]mammoth['"];?\s*\n?/g,
    ''
  );

  // Replace mammoth import with dynamic import
  optimizedContent = optimizedContent.replace(
    /import\s*\{\s*[^}]*\s*\}\s*from\s*['"]mammoth['"];?\s*\n?/g,
    ''
  );

  // Add file-utils import if not present
  if (!optimizedContent.includes('import { readFileContent }')) {
    // Find the import section and add our import
    const importRegex = /(import[^;]+;?\s*\n)+/;
    const match = optimizedContent.match(importRegex);

    if (match) {
      const lastImport = match[0];
      const newImport =
        "import { readFileContent } from '@/lib/utils/file-utils';\n";
      optimizedContent = optimizedContent.replace(
        lastImport,
        lastImport + newImport
      );
    }
  }

  // Remove the readFileContent function and replace with function call
  const functionRegex =
    /\/\/\s*Read\s*file\s*content\s*[\s\S]*?\n\s*};?\s*\n?/g;
  optimizedContent = optimizedContent.replace(functionRegex, '');

  return optimizedContent;
}

async function optimizeMammothImports() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Finding files with mammoth imports...');
  }

  const files = await findFilesWithMammoth();
  if (process.env.NODE_ENV === 'development') {
    console.log(`📁 Found ${files.length} files with mammoth imports:`);

    for (const file of files) {
      console.log(`  - ${file}`);
    }

    console.log('\n🔧 Optimizing files...');
  }

  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      const optimizedContent = optimizeFile(content);

      if (content !== optimizedContent) {
        await writeFile(file, optimizedContent, 'utf-8');
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Optimized: ${file}`);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚪ No changes needed: ${file}`);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Error optimizing ${file}:`, error);
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('\n🎉 Optimization complete!');
    console.log('\n💡 Next steps:');
    console.log('1. Run `pnpm build` to test the optimized build size');
    console.log('2. If successful, deploy with `pnpm deploy:cf`');
  }
}

if (require.main === module) {
  optimizeMammothImports().catch((error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
  });
}

export { optimizeMammothImports, findFilesWithMammoth };
