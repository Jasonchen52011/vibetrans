/**
 * 智能翻译工具完整测试套件
 *
 * 涵盖15个翻译工具的全面测试用例
 * 包括语言检测、API功能、前端交互和边界情况测试
 *
 * @author Claude AI Testing Suite
 * @version 1.0
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 测试配置
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  retryAttempts: 3,
  outputDir: './test-results',
  reportFile: 'test-report.json',
};

// 翻译工具配置
const TRANSLATOR_TOOLS = {
  // 优先级1：双语翻译工具
  'creole-to-english-translator': {
    category: 'bilingual',
    priority: 1,
    apiEndpoint: '/api/creole-to-english-translator',
    supportedFeatures: ['text', 'language-detection', 'auto-direction'],
    testCases: {
      creoleInput: 'Bonjou, koman ou ye?',
      englishInput: 'Hello, how are you?',
      mixedInput: 'Hello, koman ou ye?',
      emptyInput: '',
      longInput:
        'Bonjou. Mwen renmen pran yon ti kafe sou maten. Lè solèy leve, mwen souvan chita sou vèran mwen epi gade pèp la ap pase. Se yon bèl moman refleksyon pou mwen anvan jounn an kòmanse.',
      specialChars: 'À bientôt! Ça va bien?',
      unicodeText: '𐤖𐤂𐤍 𐤀𐤍𐤀',
      invalidJson: '{invalid json}',
    },
  },
  'chinese-to-english-translator': {
    category: 'bilingual',
    priority: 1,
    apiEndpoint: '/api/chinese-to-english-translator',
    supportedFeatures: [
      'text',
      'image',
      'audio',
      'language-detection',
      'multiple-modes',
    ],
    testCases: {
      chineseInput: '你好，很高兴认识你！',
      englishInput: 'Hello, nice to meet you!',
      technicalChinese: '这个软件使用React和Node.js开发',
      legalChinese: '根据合同法第三条规定，',
      literaryChinese: '春眠不觉晓，处处闻啼鸟。',
      mixedInput: 'Hello 你好 how are you',
      emptyInput: '',
      longInput:
        '人工智能是计算机科学的一个分支，它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。该领域的研究包括机器人、语言识别、图像识别、自然语言处理和专家系统等。',
    },
  },
  'albanian-to-english': {
    category: 'bilingual',
    priority: 1,
    apiEndpoint: '/api/albanian-to-english',
    supportedFeatures: ['text', 'language-detection'],
    testCases: {
      albanianInput: 'Përshëndetje! Si jeni ju?',
      englishInput: 'Hello! How are you?',
      mixedInput: 'Hello si jeni',
      emptyInput: '',
      albanianWithSpecialChars: 'Shqipëria është një vend i bukur në Ballkan.',
      longInput:
        'Tirana është kryeqyteti i Shqipërisë dhe qyteti më i madh i vendit. Ai është qendra politike, ekonomike dhe kulturore e vendit. Tirana ka një histori të pasur që daton nga shekulli i 17-të.',
    },
  },
  'samoan-to-english-translator': {
    category: 'bilingual',
    priority: 1,
    apiEndpoint: '/api/samoan-to-english-translator',
    supportedFeatures: ['text', 'language-detection'],
    testCases: {
      samoanInput: 'Talofa! Manuia faiva?',
      englishInput: 'Hello! How is the work?',
      mixedInput: 'Hello manuia',
      emptyInput: '',
      samoanWithMacrons: "Mālō! 'O ai lou suafa?",
      longInput:
        '"O Samoa" se tupu i le lalolagi i le vasa o le Pasifika. O se tasi o isi motu o Polinesia ma ua i ai se faiva tele i lona faasologa ma lona aganuu. O le gagana Samoa, o le faaSamoa, ma le lotu a le nuu o mea sili taua i le olaga o tagata Samoa.',
    },
  },
  'cantonese-translator': {
    category: 'bilingual',
    priority: 1,
    apiEndpoint: '/api/cantonese-translator',
    supportedFeatures: ['text', 'language-detection'],
    testCases: {
      cantoneseInput: '你好！食咗飯未呀？',
      englishInput: 'Hello! Have you eaten yet?',
      mixedInput: 'Hello 食咗飯未',
      emptyInput: '',
      cantoneseTraditional: '早晨！今日天氣幾好。',
      cantoneseWithNumbers: '我哋要去廣州3日。',
      longInput:
        '香港係一個國際金融中心，位於中國南部。佢有密集嘅高樓大廈同埋繁榮嘅經濟。香港嘅官方語言係中文同英文，而廣東話係最常用嘅中文方言。',
    },
  },

  // 优先级2：特殊语言工具
  'aramaic-translator': {
    category: 'special',
    priority: 2,
    apiEndpoint: '/api/aramaic-translator',
    supportedFeatures: ['text', 'auto-detection'],
    testCases: {
      englishInput: 'Peace be upon you',
      aramaicInput: 'ܫܠܡܐ ܥܠܝܟ',
      emptyInput: '',
      longEnglish:
        'The ancient Aramaic language was spoken throughout the Near East for thousands of years and was the language spoken by Jesus Christ.',
      mixedInput: 'Hello ܫܠܡܐ world',
      unicodeAramaic: 'ܐܒܐ ܕܒܫܡܝܐ ܐܬܐ ܠܥܠܡܐ',
      invalidUnicode: '𐤖𐤂𐤍𐤍 invalid',
    },
  },
  'baybayin-translator': {
    category: 'special',
    priority: 2,
    apiEndpoint: '/api/baybayin-translator',
    supportedFeatures: ['text', 'script-translation'],
    testCases: {
      englishInput: 'Hello Philippines',
      baybayinInput: 'ᜃᜆᜓᜎᜓᜇ᜔ ᜉ᜔ᜁᜎᜒᜉᜒᜈ᜔',
      emptyInput: '',
      tagalogInput: 'Kumusta ka?',
      longEnglish:
        'Baybayin is an ancient pre-colonial Filipino writing system. It was used in the Philippines before the arrival of the Spanish colonizers.',
      mixedScript: 'Hello ᜃᜓᜋᜓᜐ᜔ᜆ ᜃ world',
    },
  },
  'cuneiform-translator': {
    category: 'special',
    priority: 2,
    apiEndpoint: '/api/cuneiform-translator',
    supportedFeatures: ['text', 'ancient-script'],
    testCases: {
      englishInput: 'Ancient Mesopotamia',
      cuneiformInput: '楔形文字',
      emptyInput: '',
      sumerianInput: '𒀭𒈗𒍪',
      longEnglish:
        'Cuneiform is one of the earliest systems of writing, invented by the Sumerians of ancient Mesopotamia around 3500-3000 BCE.',
      mixedInput: 'Hello 楔形文字 world',
    },
  },
  'gaster-translator': {
    category: 'special',
    priority: 2,
    apiEndpoint: '/api/gaster-translator',
    supportedFeatures: ['text', 'symbol-translation'],
    testCases: {
      englishInput: 'Hello world',
      gasterInput: '♦♠♣♥',
      emptyInput: '',
      wingdingsText: '♪♫♬♩',
      longEnglish:
        'This text will be converted to various Wingdings and symbol characters used in the Gaster language from Undertale.',
      mixedInput: 'Hello ♦ world',
    },
  },
  'high-valyrian-translator': {
    category: 'special',
    priority: 2,
    apiEndpoint: '/api/high-valyrian-translator',
    supportedFeatures: ['text', 'fictional-language'],
    testCases: {
      englishInput: 'Fire and blood',
      valyrianInput: 'Zaldrīzes buzdari iksos',
      emptyInput: '',
      commonValyrian: 'Rytsas!',
      longEnglish:
        'Valyrian is a fictional language created for the Game of Thrones universe. It is one of the most well-developed fictional languages in modern media.',
      mixedInput: 'Hello Rytsas world',
    },
  },

  // 优先级4：古典/虚构语言
  'ancient-greek-translator': {
    category: 'classical',
    priority: 4,
    apiEndpoint: '/api/ancient-greek-translator',
    supportedFeatures: ['text', 'classical-language'],
    testCases: {
      englishInput: 'Hello my friend',
      greekInput: 'χαῖρε φίλε',
      emptyInput: '',
      ancientGreek: 'μῆνιν ἄειδε θεὰ Πηληϊάδεω Ἀχιλῆος',
      longEnglish:
        'Ancient Greek is the language of the classical philosophers, mathematicians, and playwrights who formed the foundation of Western civilization.',
      mixedInput: 'Hello χαῖρε world',
    },
  },
  'middle-english-translator': {
    category: 'classical',
    priority: 4,
    apiEndpoint: '/api/middle-english-translator',
    supportedFeatures: ['text', 'historical-language'],
    testCases: {
      englishInput: 'When April with its sweet showers',
      middleEnglish: 'Whan that Aprille with his shoures soote',
      emptyInput: '',
      chaucerText:
        'Whan that Aprille with his shoures soote The droghte of March hath perced to the roote',
      longEnglish:
        'Middle English was spoken in England after the Norman Conquest until the late 15th century. It evolved from Old English and was influenced by French and Latin.',
      mixedInput: 'Hello Whan that world',
    },
  },
  'esperanto-translator': {
    category: 'classical',
    priority: 4,
    apiEndpoint: '/api/esperanto-translator',
    supportedFeatures: ['text', 'constructed-language'],
    testCases: {
      englishInput: 'Hello world',
      esperantoInput: 'Saluton mondo',
      emptyInput: '',
      esperantoText: 'La espero naskiĝis en Fora Oriento',
      longEnglish:
        'Esperanto is the most widely spoken constructed international auxiliary language. It was created in the late 19th century by L. L. Zamenhof.',
      mixedInput: 'Hello Saluton world',
    },
  },
  'al-bhed-translator': {
    category: 'classical',
    priority: 4,
    apiEndpoint: '/api/al-bhed-translator',
    supportedFeatures: ['text', 'cipher-language'],
    testCases: {
      englishInput: 'Hello friend',
      alBhedInput: 'Oui fam',
      emptyInput: '',
      alBhedText: "Oui fyc drehk E's yht kuut pa dreo muja",
      longEnglish:
        'Al Bhed is a fictional cipher language from the Final Fantasy X video game. It replaces English letters with different characters following a specific substitution cipher.',
      mixedInput: 'Hello Oui fam world',
    },
  },
  'pig-latin-translator': {
    category: 'classical',
    priority: 4,
    apiEndpoint: '/api/pig-latin-translator',
    supportedFeatures: ['text', 'language-game'],
    testCases: {
      englishInput: 'Hello world',
      pigLatinInput: 'Ellohay orldway',
      emptyInput: '',
      pigLatinText: 'Isthay isay igpay atinlay',
      longEnglish:
        'Pig Latin is a language game that alters English words. Children often use it as a fun way to communicate in code. The rules are simple: move the first consonant sound to the end and add "ay".',
      mixedInput: 'Hello Ellohay world',
    },
  },
};

// 测试结果接口
interface TestResult {
  toolName: string;
  category: string;
  priority: number;
  timestamp: string;
  tests: {
    languageDetection: TestSectionResult;
    apiFunctionality: TestSectionResult;
    errorHandling: TestSectionResult;
    performance: TestSectionResult;
  };
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
  };
}

interface TestSectionResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testCases: TestCaseResult[];
}

interface TestCaseResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
}

// 主测试套件类
class TranslatorTestSuite {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  constructor() {
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory() {
    if (!fs.existsSync(TEST_CONFIG.outputDir)) {
      fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
    }
  }

  /**
   * 运行所有翻译工具的测试
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 开始智能翻译工具完整测试套件...\n');

    for (const [toolName, config] of Object.entries(TRANSLATOR_TOOLS)) {
      console.log(
        `📋 测试工具: ${toolName} (${config.category} - 优先级${config.priority})`
      );

      const result = await this.testTool(toolName, config);
      this.results.push(result);

      console.log(
        `✅ 完成 ${toolName} - 成功率: ${result.summary.successRate}%\n`
      );
    }

    await this.generateReport();
    console.log('🎉 所有测试完成！');
  }

  /**
   * 测试单个翻译工具
   */
  private async testTool(toolName: string, config: any): Promise<TestResult> {
    const toolStartTime = Date.now();
    const result: TestResult = {
      toolName,
      category: config.category,
      priority: config.priority,
      timestamp: new Date().toISOString(),
      tests: {
        languageDetection: await this.testLanguageDetection(toolName, config),
        apiFunctionality: await this.testApiFunctionality(toolName, config),
        errorHandling: await this.testErrorHandling(toolName, config),
        performance: await this.testPerformance(toolName, config),
      },
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        successRate: 0,
      },
    };

    // 计算总体统计
    const allTests = [
      result.tests.languageDetection,
      result.tests.apiFunctionality,
      result.tests.errorHandling,
      result.tests.performance,
    ];

    result.summary.totalTests = allTests.reduce(
      (sum, section) => sum + section.totalTests,
      0
    );
    result.summary.passedTests = allTests.reduce(
      (sum, section) => sum + section.passedTests,
      0
    );
    result.summary.failedTests = allTests.reduce(
      (sum, section) => sum + section.failedTests,
      0
    );
    result.summary.successRate = Math.round(
      (result.summary.passedTests / result.summary.totalTests) * 100
    );

    console.log(`   ⏱️  执行时间: ${Date.now() - toolStartTime}ms`);

    return result;
  }

  /**
   * 测试语言检测功能
   */
  private async testLanguageDetection(
    toolName: string,
    config: any
  ): Promise<TestSectionResult> {
    const testCases: TestCaseResult[] = [];

    if (!config.supportedFeatures.includes('language-detection')) {
      testCases.push({
        testName: '语言检测支持检查',
        status: 'skipped',
        duration: 0,
        details: '该工具不支持语言检测功能',
      });

      return {
        totalTests: testCases.length,
        passedTests: 0,
        failedTests: 0,
        testCases,
      };
    }

    // 测试用例1：目标语言输入检测
    testCases.push(
      await this.runTestCase('目标语言输入检测', async () => {
        const targetInput = this.getTargetLanguageInput(
          toolName,
          config.testCases
        );
        const response = await this.makeApiRequest(config.apiEndpoint, {
          text: targetInput,
          detectOnly: true,
        });

        return this.validateLanguageDetection(
          response,
          this.getExpectedTargetLanguage(toolName)
        );
      })
    );

    // 测试用例2：英语输入检测
    testCases.push(
      await this.runTestCase('英语输入检测', async () => {
        const response = await this.makeApiRequest(config.apiEndpoint, {
          text: config.testCases.englishInput,
          detectOnly: true,
        });

        return this.validateLanguageDetection(response, 'english');
      })
    );

    // 测试用例3：混合语言输入处理
    if (config.testCases.mixedInput) {
      testCases.push(
        await this.runTestCase('混合语言输入处理', async () => {
          const response = await this.makeApiRequest(config.apiEndpoint, {
            text: config.testCases.mixedInput,
            detectOnly: true,
          });

          return this.validateMixedLanguageDetection(response);
        })
      );
    }

    // 测试用例4：空输入处理
    testCases.push(
      await this.runTestCase('空输入处理', async () => {
        try {
          const response = await this.makeApiRequest(config.apiEndpoint, {
            text: '',
            detectOnly: true,
          });

          return response.error ? true : false;
        } catch (error) {
          return true; // 应该抛出错误
        }
      })
    );

    return this.summarizeTestResults(testCases);
  }

  /**
   * 测试API功能
   */
  private async testApiFunctionality(
    toolName: string,
    config: any
  ): Promise<TestSectionResult> {
    const testCases: TestCaseResult[] = [];

    // 测试用例1：自动翻译方向选择
    if (config.supportedFeatures.includes('auto-direction')) {
      testCases.push(
        await this.runTestCase('自动翻译方向选择', async () => {
          const targetInput = this.getTargetLanguageInput(
            toolName,
            config.testCases
          );
          const response = await this.makeApiRequest(config.apiEndpoint, {
            text: targetInput,
          });

          return this.validateTranslationDirection(response, 'auto');
        })
      );
    }

    // 测试用例2：手动翻译方向覆盖
    testCases.push(
      await this.runTestCase('手动翻译方向覆盖', async () => {
        const direction = this.getManualDirection(toolName);
        const response = await this.makeApiRequest(config.apiEndpoint, {
          text: config.testCases.englishInput,
          direction: direction,
        });

        return this.validateTranslationDirection(response, direction);
      })
    );

    // 测试用例3：翻译结果验证
    testCases.push(
      await this.runTestCase('翻译结果验证', async () => {
        const response = await this.makeApiRequest(config.apiEndpoint, {
          text: config.testCases.englishInput,
        });

        return this.validateTranslationResult(response);
      })
    );

    // 测试用例4：多媒体输入支持（如果支持）
    if (config.supportedFeatures.includes('image')) {
      testCases.push(
        await this.runTestCase('图片输入支持', async () => {
          // 模拟图片数据
          const base64Image =
            'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDg4MDA';
          const response = await this.makeApiRequest(config.apiEndpoint, {
            imageData: base64Image,
            imageMimeType: 'image/jpeg',
            inputType: 'image',
          });

          return this.validateImageTranslation(response);
        })
      );
    }

    return this.summarizeTestResults(testCases);
  }

  /**
   * 测试错误处理
   */
  private async testErrorHandling(
    toolName: string,
    config: any
  ): Promise<TestSectionResult> {
    const testCases: TestCaseResult[] = [];

    // 测试用例1：无效JSON处理
    testCases.push(
      await this.runTestCase('无效JSON处理', async () => {
        try {
          await this.makeApiRequest(config.apiEndpoint, 'invalid json', 'POST');
          return false; // 应该抛出错误
        } catch (error) {
          return true; // 正确抛出错误
        }
      })
    );

    // 测试用例2：超长文本处理
    testCases.push(
      await this.runTestCase('超长文本处理', async () => {
        const longText = 'a'.repeat(10000); // 10K字符
        const response = await this.makeApiRequest(config.apiEndpoint, {
          text: longText,
        });

        return response.error ? true : false;
      })
    );

    // 测试用例3：特殊字符处理
    if (config.testCases.specialChars || config.testCases.unicodeText) {
      testCases.push(
        await this.runTestCase('特殊字符处理', async () => {
          const specialText =
            config.testCases.specialChars || config.testCases.unicodeText;
          const response = await this.makeApiRequest(config.apiEndpoint, {
            text: specialText,
          });

          return !response.error;
        })
      );
    }

    return this.summarizeTestResults(testCases);
  }

  /**
   * 测试性能
   */
  private async testPerformance(
    toolName: string,
    config: any
  ): Promise<TestSectionResult> {
    const testCases: TestCaseResult[] = [];

    // 测试用例1：响应时间测试
    testCases.push(
      await this.runTestCase('响应时间测试', async () => {
        const startTime = Date.now();
        await this.makeApiRequest(config.apiEndpoint, {
          text: config.testCases.englishInput,
        });
        const duration = Date.now() - startTime;

        return duration < 10000; // 10秒内响应
      })
    );

    // 测试用例2：并发请求测试
    testCases.push(
      await this.runTestCase('并发请求测试', async () => {
        const promises = Array(5)
          .fill(null)
          .map(() =>
            this.makeApiRequest(config.apiEndpoint, {
              text: config.testCases.englishInput,
            })
          );

        const results = await Promise.all(promises);
        return results.every((result) => !result.error);
      })
    );

    return this.summarizeTestResults(testCases);
  }

  /**
   * 执行单个测试用例
   */
  private async runTestCase(
    testName: string,
    testFunction: () => Promise<boolean>
  ): Promise<TestCaseResult> {
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        testFunction(),
        new Promise<boolean>((_, reject) =>
          setTimeout(
            () => reject(new Error('Test timeout')),
            TEST_CONFIG.timeout
          )
        ),
      ]);

      return {
        testName,
        status: result ? 'passed' : 'failed',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        testName,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 发送API请求
   */
  private async makeApiRequest(
    endpoint: string,
    data: any,
    method = 'POST'
  ): Promise<any> {
    const url = `${TEST_CONFIG.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: typeof data === 'string' ? data : JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API请求失败 ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * 验证语言检测结果
   */
  private validateLanguageDetection(
    response: any,
    expectedLanguage: string
  ): boolean {
    if (!response || !response.detectedInputLanguage) {
      return false;
    }

    const detected = response.detectedInputLanguage.toLowerCase();
    const expected = expectedLanguage.toLowerCase();

    return detected.includes(expected) || expected.includes(detected);
  }

  /**
   * 验证混合语言检测
   */
  private validateMixedLanguageDetection(response: any): boolean {
    if (!response || !response.detectedInputLanguage) {
      return false;
    }

    // 混合语言检测应该有较低的信度或者返回"mixed"
    return (
      response.confidence < 0.8 || response.detectedInputLanguage === 'mixed'
    );
  }

  /**
   * 验证翻译方向
   */
  private validateTranslationDirection(
    response: any,
    expectedDirection: string
  ): boolean {
    if (!response || !response.direction) {
      return false;
    }

    if (expectedDirection === 'auto') {
      return response.autoDetected === true;
    }

    return response.direction === expectedDirection;
  }

  /**
   * 验证翻译结果
   */
  private validateTranslationResult(response: any): boolean {
    if (!response) {
      return false;
    }

    return (
      response.translated &&
      response.original &&
      typeof response.translated === 'string' &&
      response.translated.length > 0
    );
  }

  /**
   * 验证图片翻译
   */
  private validateImageTranslation(response: any): boolean {
    if (!response) {
      return false;
    }

    return (
      response.translated &&
      response.extractedText &&
      response.inputType === 'image'
    );
  }

  /**
   * 汇总测试结果
   */
  private summarizeTestResults(testCases: TestCaseResult[]): TestSectionResult {
    const totalTests = testCases.length;
    const passedTests = testCases.filter((tc) => tc.status === 'passed').length;
    const failedTests = testCases.filter((tc) => tc.status === 'failed').length;

    return {
      totalTests,
      passedTests,
      failedTests,
      testCases,
    };
  }

  /**
   * 获取目标语言输入
   */
  private getTargetLanguageInput(toolName: string, testCases: any): string {
    const keyMap: Record<string, string> = {
      'creole-to-english-translator': 'creoleInput',
      'chinese-to-english-translator': 'chineseInput',
      'albanian-to-english': 'albanianInput',
      'samoan-to-english-translator': 'samoanInput',
      'cantonese-translator': 'cantoneseInput',
      'aramaic-translator': 'aramaicInput',
      'baybayin-translator': 'baybayinInput',
      'cuneiform-translator': 'cuneiformInput',
      'gaster-translator': 'gasterInput',
      'high-valyrian-translator': 'valyrianInput',
      'ancient-greek-translator': 'greekInput',
      'middle-english-translator': 'middleEnglish',
      'esperanto-translator': 'esperantoInput',
      'al-bhed-translator': 'alBhedInput',
      'pig-latin-translator': 'pigLatinInput',
    };

    const key = keyMap[toolName] || 'targetLanguageInput';
    return testCases[key] || testCases.englishInput;
  }

  /**
   * 获取期望的目标语言
   */
  private getExpectedTargetLanguage(toolName: string): string {
    const languageMap: Record<string, string> = {
      'creole-to-english-translator': 'creole',
      'chinese-to-english-translator': 'chinese',
      'albanian-to-english': 'albanian',
      'samoan-to-english-translator': 'samoan',
      'cantonese-translator': 'cantonese',
      'aramaic-translator': 'aramaic',
      'baybayin-translator': 'baybayin',
      'cuneiform-translator': 'cuneiform',
      'gaster-translator': 'gaster',
      'high-valyrian-translator': 'valyrian',
      'ancient-greek-translator': 'greek',
      'middle-english-translator': 'middle-english',
      'esperanto-translator': 'esperanto',
      'al-bhed-translator': 'al-bhed',
      'pig-latin-translator': 'pig-latin',
    };

    return languageMap[toolName] || 'unknown';
  }

  /**
   * 获取手动方向
   */
  private getManualDirection(toolName: string): string {
    const directionMap: Record<string, string> = {
      'creole-to-english-translator': 'creole-to-en',
      'chinese-to-english-translator': 'zh-to-en',
      'albanian-to-english': 'al-to-en',
      'samoan-to-english-translator': 'sm-to-en',
      'cantonese-translator': 'yue-to-en',
      'aramaic-translator': 'toAramaic',
      'baybayin-translator': 'toBaybayin',
      'cuneiform-translator': 'toCuneiform',
      'gaster-translator': 'toGaster',
      'high-valyrian-translator': 'toValyrian',
      'ancient-greek-translator': 'toGreek',
      'middle-english-translator': 'toMiddleEnglish',
      'esperanto-translator': 'toEsperanto',
      'al-bhed-translator': 'toAlBhed',
      'pig-latin-translator': 'toPigLatin',
    };

    return directionMap[toolName] || 'auto';
  }

  /**
   * 生成测试报告
   */
  private async generateReport(): Promise<void> {
    const totalDuration = Date.now() - this.startTime;

    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        totalDuration,
        totalTools: this.results.length,
        overallSuccessRate: Math.round(
          this.results.reduce(
            (sum, result) => sum + result.summary.successRate,
            0
          ) / this.results.length
        ),
        categorySummary: this.generateCategorySummary(),
        prioritySummary: this.generatePrioritySummary(),
      },
      toolResults: this.results,
    };

    const reportPath = path.join(TEST_CONFIG.outputDir, TEST_CONFIG.reportFile);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📊 测试报告已生成: ${reportPath}`);
    this.printSummary(report);
  }

  /**
   * 生成分类汇总
   */
  private generateCategorySummary(): any {
    const categories = ['bilingual', 'special', 'classical'];
    return categories.map((category) => {
      const categoryResults = this.results.filter(
        (r) => r.category === category
      );
      return {
        category,
        count: categoryResults.length,
        avgSuccessRate: Math.round(
          categoryResults.reduce((sum, r) => sum + r.summary.successRate, 0) /
            categoryResults.length
        ),
      };
    });
  }

  /**
   * 生成优先级汇总
   */
  private generatePrioritySummary(): any {
    const priorities = [1, 2, 4];
    return priorities.map((priority) => {
      const priorityResults = this.results.filter(
        (r) => r.priority === priority
      );
      return {
        priority,
        count: priorityResults.length,
        avgSuccessRate: Math.round(
          priorityResults.reduce((sum, r) => sum + r.summary.successRate, 0) /
            priorityResults.length
        ),
      };
    });
  }

  /**
   * 打印测试汇总
   */
  private printSummary(report: any): void {
    console.log('\n📈 测试汇总:');
    console.log(`   总耗时: ${report.summary.totalDuration}ms`);
    console.log(`   工具总数: ${report.summary.totalTools}`);
    console.log(`   整体成功率: ${report.summary.overallSuccessRate}%`);

    console.log('\n📊 分类结果:');
    report.summary.categorySummary.forEach((cat: any) => {
      console.log(
        `   ${cat.category}: ${cat.count}个工具, 平均成功率: ${cat.avgSuccessRate}%`
      );
    });

    console.log('\n🎯 优先级结果:');
    report.summary.prioritySummary.forEach((pri: any) => {
      console.log(
        `   优先级${pri.priority}: ${pri.count}个工具, 平均成功率: ${pri.avgSuccessRate}%`
      );
    });

    console.log('\n❌ 失败的测试:');
    this.results.forEach((result) => {
      const failedTests = result.tests.languageDetection.testCases
        .concat(result.tests.apiFunctionality.testCases)
        .concat(result.tests.errorHandling.testCases)
        .concat(result.tests.performance.testCases)
        .filter((tc) => tc.status === 'failed');

      if (failedTests.length > 0) {
        console.log(`   ${result.toolName}:`);
        failedTests.forEach((test) => {
          console.log(`     - ${test.testName}: ${test.error}`);
        });
      }
    });
  }
}

// 导出测试套件
export { TranslatorTestSuite, TRANSLATOR_TOOLS, TEST_CONFIG };

// 如果直接运行此文件，执行测试
if (require.main === module) {
  const testSuite = new TranslatorTestSuite();
  testSuite.runAllTests().catch(console.error);
}
