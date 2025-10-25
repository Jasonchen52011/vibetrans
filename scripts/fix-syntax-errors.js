import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";

async function fixSyntaxErrors() {
  const files = await glob("src/**/*{Tool,Tool}.tsx", {
    ignore: ["**/node_modules/**"]
  });

  for (const file of files) {
    try {
      const content = await readFile(file, "utf-8");
      let fixedContent = content;

      // Fix broken else statements
      fixedContent = fixedContent.replace(/\} else \{/g, "} else {");
      
      // Add missing file reading function calls
      if (content.includes("reader.onerror") && content.includes("fileExtension")) {
        const regex = /reader\.onload[^}]+reader\.onerror[^}]+}\s*}\s*if[^}]+}/g;
        fixedContent = fixedContent.replace(regex, `reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(file);
        });
      }
      
      if (content !== fixedContent) {
        await writeFile(file, fixedContent, "utf-8");
        console.log(\`Fixed: \${file}\`);
      }
    } catch (error) {
      console.error(\`Error fixing \${file}:\`, error);
    }
  }
}

fixSyntaxErrors().catch(console.error);
