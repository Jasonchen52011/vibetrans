#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

interface Example {
  standard?: string;
  translated?: string;
  meaning?: string;
  description?: string;
  content?: string;
}

interface ToolContent {
  example?: {
    slangTable?: Example[];
    description?: string;
    wordCount?: number;
  };
  examples?: {
    slangTable?: Example[];
    description?: string;
    wordCount?: number;
  };
  funFacts?: Array<{
    content: string;
    wordCount?: number;
  }>;
  testimonials?: Array<{
    content: string;
    wordCount?: number;
  }>;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function analyzeToolContent(toolPath: string, toolName: string): void {
  try {
    const contentPath = path.join(toolPath, 'content.json');

    if (!fs.existsSync(contentPath)) {
      return;
    }

    const content: ToolContent = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

    console.log(`\n=== ${toolName.toUpperCase()} ===`);

    // Analyze examples/slangTable
    const examples = content.example?.slangTable || content.examples?.slangTable || [];
    if (examples.length > 0) {
      console.log('\nExamples/SlangTable:');
      examples.forEach((example, index) => {
        if (example.meaning) {
          const wordCount = countWords(example.meaning);
          console.log(`  ${index + 1}. "${example.meaning}" - ${wordCount} words`);
          if (wordCount < 10) {
            console.log(`     ⚠️  SHORT: Less than 10 words!`);
          }
        }
        if (example.description) {
          const wordCount = countWords(example.description);
          console.log(`  ${index + 1}. "${example.description}" - ${wordCount} words`);
          if (wordCount < 10) {
            console.log(`     ⚠️  SHORT: Less than 10 words!`);
          }
        }
      });
    }

    // Analyze fun facts
    const funFacts = content.funFacts || [];
    if (funFacts.length > 0) {
      console.log('\nFun Facts:');
      funFacts.forEach((fact, index) => {
        if (fact.content) {
          const wordCount = countWords(fact.content);
          console.log(`  ${index + 1}. "${fact.content}" - ${wordCount} words`);
          if (wordCount < 10) {
            console.log(`     ⚠️  SHORT: Less than 10 words!`);
          }
        }
      });
    }

    // Analyze testimonials
    const testimonials = content.testimonials || [];
    if (testimonials.length > 0) {
      console.log('\nTestimonials:');
      testimonials.forEach((testimonial, index) => {
        if (testimonial.content) {
          const wordCount = countWords(testimonial.content);
          console.log(`  ${index + 1}. "${testimonial.content.substring(0, 100)}..." - ${wordCount} words`);
          if (wordCount < 10) {
            console.log(`     ⚠️  SHORT: Less than 10 words!`);
          }
        }
      });
    }

  } catch (error) {
    console.error(`Error analyzing ${toolName}:`, error);
  }
}

function main() {
  const toolsDir = path.join(process.cwd(), '.tool-generation');

  if (!fs.existsSync(toolsDir)) {
    console.error('Tools directory not found!');
    return;
  }

  const tools = fs.readdirSync(toolsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log('Analyzing tool examples for short content (< 10 words)...');

  let totalShortExamples = 0;

  tools.forEach(tool => {
    const toolPath = path.join(toolsDir, tool);
    analyzeToolContent(toolPath, tool);
  });

  console.log('\n=== SUMMARY ===');
  console.log('Analysis complete. Check above for ⚠️ warnings about short examples.');
}

main();