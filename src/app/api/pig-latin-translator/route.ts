import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Convert a word to Pig Latin
 * Rules:
 * 1. Words starting with consonants: Move consonant cluster to end and add 'ay'
 * 2. Words starting with vowels: Add 'yay' to the end
 */
function convertToPigLatin(word: string): string {
  if (!word) return '';

  const vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
  const firstChar = word.charAt(0);

  // Check if the word starts with a vowel
  if (vowels.includes(firstChar)) {
    return word + 'yay';
  }

  // Find the first vowel position
  let firstVowelIndex = -1;
  for (let i = 0; i < word.length; i++) {
    if (vowels.includes(word.charAt(i))) {
      firstVowelIndex = i;
      break;
    }
  }

  // If no vowel found, just add 'ay' at the end
  if (firstVowelIndex === -1) {
    return word + 'ay';
  }

  // Move consonant cluster to end and add 'ay'
  const consonantCluster = word.slice(0, firstVowelIndex);
  const rest = word.slice(firstVowelIndex);
  return rest + consonantCluster.toLowerCase() + 'ay';
}

/**
 * Convert text to Pig Latin while preserving punctuation and capitalization
 */
function translateToPigLatin(text: string): string {
  // Split text into words while preserving punctuation
  const words = text.match(/\b[\w']+\b|[^\w\s]/g) || [];

  return words.map(token => {
    // If token is punctuation or whitespace, return as is
    if (!/\w/.test(token)) {
      return token;
    }

    // Check if the word starts with uppercase
    const isCapitalized = /^[A-Z]/.test(token);

    // Convert to Pig Latin
    let pigLatinWord = convertToPigLatin(token);

    // Restore capitalization
    if (isCapitalized && pigLatinWord.length > 0) {
      pigLatinWord = pigLatinWord.charAt(0).toUpperCase() + pigLatinWord.slice(1).toLowerCase();
    }

    return pigLatinWord;
  }).join('');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text: string;
    };
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Translate to Pig Latin
    const translated = translateToPigLatin(text);

    return NextResponse.json({
      translated: translated,
      original: text,
      message: 'Translation successful',
    });
  } catch (error: any) {
    console.error('Translation error:', error);

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
