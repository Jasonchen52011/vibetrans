#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

interface Example {
  standard: string;
  translated: string;
  meaning: string;
}

interface ToolContent {
  example: {
    slangTable: Example[];
  };
}

const meaningReplacements: { [key: string]: string } = {
  "Used to describe mood": "This psychological description transforms an emotional state into articulate expression. It conveys feelings of joy and contentment using sophisticated vocabulary that captures the complexity of human emotions.",

  "Used to express ignorance": "This intellectual expression transforms lack of knowledge into eloquent language. It communicates uncertainty or unawareness using formal vocabulary that sounds more educated and thoughtful.",

  "Used to describe appearance": "This descriptive transformation turns a simple visual observation into detailed expression. It communicates how something looks using sophisticated vocabulary that paints a vivid picture for the listener.",

  "Used to express time passing quickly": "This temporal expression transforms the perception of time into eloquent language. It communicates the rapid passage of time using sophisticated vocabulary that captures the subjective experience of time flying.",

  "Used to express fondness": "This emotional transformation turns a simple feeling of affection into articulate expression. It communicates deep care and positive sentiment using sophisticated vocabulary that conveys genuine emotional connection.",

  "Used to express lack of interest": "This psychological expression transforms boredom into sophisticated language. It communicates disengagement and lack of stimulation using formal vocabulary that sounds more intellectual and articulate.",

  "Used to describe departure": "This spatial expression transforms someone leaving into eloquent description. It communicates the act of departure using formal vocabulary that sounds more professional and socially appropriate.",

  "Used to describe noise level": "This auditory expression transforms sound perception into sophisticated language. It communicates high volume using formal vocabulary that sounds more educated and technically precise.",

  "Used to describe stature": "This physical description transforms height observation into articulate expression. It communicates someone's vertical measurement using sophisticated vocabulary that sounds more formal and descriptive.",

  "Used to describe humor": "This psychological expression transforms comedic perception into eloquent language. It communicates something's ability to provoke laughter using sophisticated vocabulary that sounds more intellectual and cultured.",

  "Used to express tiredness": "This physical expression transforms fatigue into articulate language. It communicates the need for rest using sophisticated vocabulary that captures both physical and mental exhaustion.",

  "Used to describe winning": "This competitive expression transforms victory into eloquent description. It communicates success in competition using formal vocabulary that sounds more accomplished and sophisticated.",

  "Used to describe damage": "This descriptive transformation turns the state of being broken into articulate expression. It communicates disrepair or malfunction using sophisticated vocabulary that sounds more technical and precise.",

  "Used to express agreement": "This social expression transforms consent into eloquent language. It communicates alignment of opinion using formal vocabulary that sounds more educated and intellectually engaged.",

  "Used to describe something positive": "This evaluative expression transforms positivity into sophisticated language. It communicates favorable assessment using articulate vocabulary that sounds more thoughtful and well-spoken."
};

function main() {
  const filePath = path.join(process.cwd(), '.tool-generation/verbose-generator/content.json');

  try {
    const content: ToolContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let replacedCount = 0;

    content.example.slangTable.forEach((example, index) => {
      const currentMeaning = example.meaning;

      if (meaningReplacements[currentMeaning]) {
        example.meaning = meaningReplacements[currentMeaning];
        replacedCount++;
        console.log(`Replaced example ${index + 1}: "${example.standard}"`);
      }
    });

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');

    console.log(`\nSuccessfully replaced ${replacedCount} meanings in verbose-generator/content.json`);

  } catch (error) {
    console.error('Error processing verbose-generator content:', error);
  }
}

main();