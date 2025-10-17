import { detectLanguage } from '@/lib/language-detection';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TO_HIGH_VALYRIAN_PROMPT = `You are an expert in High Valyrian language and the linguistic world of Game of Thrones.

TASK:
- Translate the INPUT English text into High Valyrian
- Use authentic High Valyrian vocabulary and grammar structures
- Apply proper Valyrian phonology and morphological rules
- Maintain the poetic and elegant nature of the High Valyrian language
- Use appropriate honorifics and formal constructions where suitable

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or context of the original text
- Keep the same paragraph structure and formatting
- Use proper High Valyrian grammar and vocabulary
- Maintain the aesthetic and cultural essence of Valyrian

OUTPUT:
- Return ONLY the High Valyrian text, nothing else`;

const TO_ENGLISH_PROMPT = `You are an expert in High Valyrian language and the linguistic world of Game of Thrones.

TASK:
- Translate the INPUT High Valyrian text into modern English
- Provide accurate translation maintaining the original meaning and cultural context
- Consider the poetic and formal nature of High Valyrian expressions
- Use clear, modern English while preserving the essence of Valyrian communication

RULES:
- Do NOT add extra explanations or commentary
- Do NOT change the core meaning or context
- Keep the same paragraph structure and formatting
- Provide a faithful translation that captures Valyrian nuances
- Maintain cultural and linguistic accuracy

OUTPUT:
- Return ONLY the English translation, nothing else`;

async function translateWithAI(
  text: string,
  direction: 'toHighValyrian' | 'toEnglish'
): Promise<string> {
  try {
    const prompt =
      direction === 'toHighValyrian'
        ? TO_HIGH_VALYRIAN_PROMPT
        : TO_ENGLISH_PROMPT;

    const { text: translatedText } = await generateText({
      model: google('gemini-2.0-flash'),
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
      temperature: 0.3, // Lower temperature for more accurate linguistic translation
    });

    return translatedText.trim();
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Failed to translate text');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, direction = 'auto', detectOnly = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    // 智能检测输入语言和翻译方向
    let finalDirection: 'toHighValyrian' | 'toEnglish';
    let autoDetected = false;
    let explanation = '';
    let detection;

    // 使用语言检测库获取基本信息
    detection = detectLanguage(text, 'valyrian');

    if (direction === 'auto') {
      if (
        detection.detectedLanguage === 'valyrian' ||
        detection.detectedLanguage === 'unknown'
      ) {
        // 检查是否包含已知的瓦雷利亚语词汇
        const valyrianWords =
          /\b(āeksio|dohaer|rider|valar|morghulis|ziry|kostilus|kirimvose|lēkia|āeha|uēny|jaelan|va|daor|muña|kepa|vīl|bē|pās|zȳhon|qogralar|kelīrēs|ȳdras|jēda|mērī|skoros|ñuhoso|aelia|vējos|dārys|valonqar|rȳbā|minides|pōja|lēkia|vēz|mandia|issa|vōlor|jemē|lēkia|zȳrys|ghesper|mazembar|vōdis|gēlion|bē|pās|rhaes|aeksia|ȳdra|dārā|vāedar|qorrion|lanna|zokla|vēzmen|kelī|tubī|daor|valar|morghulis|zȳri|kessa|jemē|lia|vēzo|gīda|jikagon|keligon|ōñon|dovaogēdy|tubī|daor)\b/i.test(
            text
          );

        if (valyrianWords || detection.detectedLanguage === 'valyrian') {
          finalDirection = 'toEnglish';
          explanation = '检测到瓦雷利亚语特征，设置为瓦雷利亚语到英语翻译';
        } else {
          finalDirection = 'toHighValyrian';
          explanation = '检测到拉丁字符，设置为英语到瓦雷利亚语翻译';
        }
      } else if (detection.detectedLanguage === 'english') {
        finalDirection = 'toHighValyrian';
        explanation = '检测到英语，设置为英语到瓦雷利亚语翻译';
      } else {
        finalDirection = 'toHighValyrian';
        explanation = '无法确定语言，默认设置为英语到瓦雷利亚语翻译';
      }
      autoDetected = true;
    } else {
      // 用户指定方向时的验证逻辑
      const userSpecifiedDirection = direction;

      // 检测输入语言是否与指定方向匹配
      const isInputEnglish = detection.detectedLanguage === 'english';
      const hasValyrianWords = /\b(valar|morghulis|ziry|kostilus|kirimvose|lēkia|āeha|uēny|jaelan|va|daor|muña|kepa|vīl|bē|pās|zȳhon|qogralar|kelīrēs|ȳdras|jēda|mērī|skoros|ñuhoso|aelia|vējos|dārys|valonqar|rȳbā|minides|pōja|vēz|mandia|issa|vōlor|jemē|zȳrys|ghesper|mazembar|vōdis|gēlion|rhaes|aeksia|ȳdra|dārā|vāedar|qorrion|lanna|zokla|vēzmen|kelī|tubī|zȳri|kessa|lia|vēzo|gīda|jikagon|keligon|ōñon|dovaogēdy|rytsas|kesys|skorosi|dovaogēdy|zaldrīzes|valyrio|muño|ēlies|hen|qogralbar|mazverdāghes|gēlenka|irge|zōbrie|jelmāzo|bantis|prōmphas|gevī|rȳnytsia|ñuhor|tobē|vēzos|kelīrīs|dōrī|jikāgon|ao|daorun|qogror|gīda|ñuha|vok|vaesis|jelmā|sōvēs|pāvot|kepa|uēpa|ola|ñuqae|kostilā|valōqas|ullus|qorrbor|lēkia)\b/i.test(text);
      const hasValyrianCharacters = /[āēīōūȳ]/.test(text);

      // 如果用户指定toEnglish但输入明显是英语，自动修正为toHighValyrian
      if (userSpecifiedDirection === 'toEnglish' && isInputEnglish && !hasValyrianWords && !hasValyrianCharacters) {
        finalDirection = 'toHighValyrian';
        explanation = '检测到输入为英语但指定了英语翻译，已自动修正为英语到瓦雷利亚语翻译';
      }
      // 如果用户指定toHighValyrian但输入明显是瓦雷利亚语，自动修正为toEnglish
      else if (userSpecifiedDirection === 'toHighValyrian' && hasValyrianWords && !isInputEnglish) {
        finalDirection = 'toEnglish';
        explanation = '检测到输入为瓦雷利亚语但指定了瓦雷利亚语翻译，已自动修正为瓦雷利亚语到英语翻译';
      }
      // 否则尊重用户选择
      else {
        finalDirection = userSpecifiedDirection;
        explanation = `使用用户指定的翻译方向: ${userSpecifiedDirection}`;
      }
    }

    // 如果只是检测语言，返回检测结果
    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage:
          detection.detectedLanguage === 'valyrian'
            ? 'valyrian'
            : detection.detectedLanguage === 'english'
              ? 'english'
              : 'unknown',
        detectedDirection:
          finalDirection === 'toEnglish' ? 'valyrian-to-en' : 'en-to-valyrian',
        confidence: detection.confidence,
        autoDetected: true,
        languageInfo: {
          detected: true,
          explanation: explanation,
          originalInput: direction,
          finalDirection: finalDirection,
        },
      });
    }

    // 清理文本
    const cleanedText = text.trim();

    // 执行翻译
    const translatedText = await translateWithAI(cleanedText, finalDirection);

    return NextResponse.json({
      original: cleanedText,
      translated: translatedText,
      direction: finalDirection,
      success: true,
      autoDetected: autoDetected,
      languageInfo: {
        detected: autoDetected,
        explanation: explanation,
        originalInput: direction,
        finalDirection: finalDirection,
      },
    });
  } catch (error: any) {
    console.error('Error processing High Valyrian translation:', error);
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
        'High Valyrian Translator API - Use POST method to translate text',
      version: '1.0',
      supported_directions: ['toHighValyrian', 'toEnglish', 'auto'],
      maxLength: 5000,
      powered_by: 'Google Gemini 2.0 Flash',
    },
    { status: 200 }
  );
}
