import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Ancient Greek dictionary for single word translations
const ANCIENT_GREEK_DICTIONARY: Record<
  string,
  {
    greek: string;
    pronunciation: string;
    culturalContext: string;
  }
> = {
  // Common words
  hello: {
    greek: 'χαῖρε (chaíre)',
    pronunciation: 'KHAH-ee-reh',
    culturalContext:
      'A common greeting meaning "rejoice" or "be happy", used in both formal and informal contexts.',
  },
  goodbye: {
    greek: 'χαίρειν (chaírein)',
    pronunciation: 'KHAH-ee-reign',
    culturalContext: 'Literally "to rejoice", used when parting from someone.',
  },
  love: {
    greek: 'ἀγάπη (agápē)',
    pronunciation: 'ah-GAH-pay',
    culturalContext:
      'One of four Greek words for love, representing unconditional, selfless love often associated with divine or spiritual love.',
  },
  wisdom: {
    greek: 'σοφία (sophía)',
    pronunciation: 'soh-FEE-ah',
    culturalContext:
      'A highly valued concept in Greek philosophy, representing both practical and theoretical knowledge.',
  },
  truth: {
    greek: 'ἀλήθεια (alḗtheia)',
    pronunciation: 'ah-LAY-thay-ah',
    culturalContext:
      'Literally "not hidden" or "unconcealment", central to Greek philosophy and epistemology.',
  },
  beauty: {
    greek: 'κάλλος (kállos)',
    pronunciation: 'KAH-los',
    culturalContext:
      'A fundamental concept in Greek aesthetics, often linked with goodness (καλοκαγαθία).',
  },
  good: {
    greek: 'ἀγαθός (agathós)',
    pronunciation: 'ah-gah-THOS',
    culturalContext:
      'Used to describe moral goodness and virtue, central to Greek ethics.',
  },
  friend: {
    greek: 'φίλος (phílos)',
    pronunciation: 'FEE-los',
    culturalContext:
      'Friendship was highly valued in ancient Greece, with φιλία (philia) being one of the four types of love.',
  },
  teacher: {
    greek: 'διδάσκαλος (didáskalos)',
    pronunciation: 'dee-DAHS-kah-los',
    culturalContext:
      'Teachers and philosophers held high status in ancient Greek society.',
  },
  student: {
    greek: 'μαθητής (mathētḗs)',
    pronunciation: 'mah-thay-TAYS',
    culturalContext:
      'A learner or disciple, often used to describe followers of philosophers.',
  },
  philosophy: {
    greek: 'φιλοσοφία (philosophía)',
    pronunciation: 'fee-loh-soh-FEE-ah',
    culturalContext:
      'Literally "love of wisdom", the foundation of Western intellectual tradition.',
  },
  democracy: {
    greek: 'δημοκρατία (dēmokratía)',
    pronunciation: 'day-moh-krah-TEE-ah',
    culturalContext:
      'Ancient Athens developed the first known democracy, where citizens directly participated in governance.',
  },
  hero: {
    greek: 'ἥρως (hḗrōs)',
    pronunciation: 'HAY-rohs',
    culturalContext:
      'Heroes were central to Greek mythology and culture, often demigods who performed extraordinary deeds.',
  },
  god: {
    greek: 'θεός (theós)',
    pronunciation: 'theh-OHS',
    culturalContext:
      'The Greeks believed in a pantheon of gods who actively influenced human affairs.',
  },
  goddess: {
    greek: 'θεά (theá)',
    pronunciation: 'theh-AH',
    culturalContext:
      'Female deities held significant power in Greek mythology, like Athena and Hera.',
  },
  war: {
    greek: 'πόλεμος (pólemos)',
    pronunciation: 'POH-leh-mos',
    culturalContext:
      'War was a frequent reality in ancient Greece, celebrated in epic poetry like the Iliad.',
  },
  peace: {
    greek: 'εἰρήνη (eirḗnē)',
    pronunciation: 'ay-RAY-nay',
    culturalContext:
      'Peace was personified as the goddess Eirene, daughter of Zeus and Themis.',
  },
  time: {
    greek: 'χρόνος (chrónos)',
    pronunciation: 'KHROH-nos',
    culturalContext:
      'Greeks had two concepts of time: chronos (chronological) and kairos (opportune moment).',
  },
  soul: {
    greek: 'ψυχή (psychḗ)',
    pronunciation: 'psoo-KHAY',
    culturalContext:
      'The immortal essence of a person, central to Greek philosophy and religion.',
  },
  virtue: {
    greek: 'ἀρετή (aretḗ)',
    pronunciation: 'ah-reh-TAY',
    culturalContext:
      'Excellence or moral virtue, the ultimate goal of Greek ethics and education.',
  },
  courage: {
    greek: 'ἀνδρεία (andreía)',
    pronunciation: 'ahn-DRAY-ah',
    culturalContext:
      'One of the cardinal virtues in Greek philosophy, essential for the ideal citizen.',
  },
  justice: {
    greek: 'δικαιοσύνη (dikaiosýnē)',
    pronunciation: 'dee-kah-yoh-SEE-nay',
    culturalContext: "A central concept in Plato's Republic and Greek law.",
  },
  knowledge: {
    greek: 'γνῶσις (gnôsis)',
    pronunciation: 'GNOH-sis',
    culturalContext:
      'Knowledge was pursued through both rational inquiry and mystical revelation.',
  },
  city: {
    greek: 'πόλις (pólis)',
    pronunciation: 'POH-lis',
    culturalContext:
      'The city-state was the fundamental political unit of ancient Greece.',
  },
  theater: {
    greek: 'θέατρον (théatron)',
    pronunciation: 'THEH-ah-tron',
    culturalContext:
      'Theater was an important civic and religious institution, with annual dramatic festivals.',
  },
};

const TO_GREEK_PROMPT = `You are an "Ancient Greek Translator", specializing in translating modern English into Ancient Greek (Koine Greek or Classical Greek).

TASK:
- Translate the INPUT text into Ancient Greek while preserving the meaning
- Use authentic Ancient Greek vocabulary and grammatical structures
- Provide both Greek text (with proper diacritics) and transliteration
- Keep the translation academically accurate and historically appropriate

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or facts
- Keep the same paragraph structure and formatting
- Use classical Greek conventions when possible
- If the concept didn't exist in ancient times, use the closest equivalent

OUTPUT:
- Return ONLY the translated text in Ancient Greek, nothing else`;

const TO_ENGLISH_PROMPT = `You are an "Ancient Greek Translator", specializing in translating Ancient Greek into modern English.

TASK:
- Translate the Ancient Greek text into clear, modern English
- Preserve the nuances and cultural context when possible
- Provide accurate translation while making it accessible to modern readers

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or facts
- Keep the same paragraph structure and formatting
- Translate idioms and cultural references appropriately

OUTPUT:
- Return ONLY the translated text in modern English, nothing else`;

async function translateWithAI(
  text: string,
  mode: 'toGreek' | 'toEnglish'
): Promise<string> {
  try {
    const prompt = mode === 'toGreek' ? TO_GREEK_PROMPT : TO_ENGLISH_PROMPT;

    const { text: translatedText } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3, // Lower temperature for more accurate translations
    });

    return translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Failed to translate text');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: 'toGreek' | 'toEnglish';
    };
    const { text, mode = 'toGreek' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter some text' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Check if input is a single word (for dictionary lookup)
    const trimmedText = text.trim();
    const isSingleWord =
      mode === 'toGreek' &&
      !trimmedText.includes(' ') &&
      trimmedText.length > 0;

    if (isSingleWord) {
      const lowerText = trimmedText.toLowerCase();
      const dictionaryEntry = ANCIENT_GREEK_DICTIONARY[lowerText];

      if (dictionaryEntry) {
        return NextResponse.json({
          original: text,
          translated: dictionaryEntry.greek,
          pronunciation: dictionaryEntry.pronunciation,
          culturalContext: dictionaryEntry.culturalContext,
          mode: mode,
          success: true,
          isDictionaryLookup: true,
        });
      }
    }

    // Perform translation using AI for sentences or words not in dictionary
    const translatedText = await translateWithAI(text, mode);

    return NextResponse.json({
      original: text,
      translated: translatedText,
      mode: mode,
      success: true,
      isDictionaryLookup: false,
    });
  } catch (error: any) {
    console.error('Error processing Ancient Greek translation:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process translation',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message:
        'Ancient Greek Translator API - Use POST method to translate text',
      version: '1.0',
      supported_modes: ['toGreek', 'toEnglish'],
      maxLength: 5000,
      dictionarySize: Object.keys(ANCIENT_GREEK_DICTIONARY).length,
      powered_by: 'Google Gemini 2.0 Flash',
    },
    { status: 200 }
  );
}
