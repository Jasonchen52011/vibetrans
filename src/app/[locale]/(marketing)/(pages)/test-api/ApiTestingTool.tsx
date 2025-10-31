'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

interface ApiTest {
  name: string;
  path: string;
  method: 'GET' | 'POST';
  description: string;
  testPayload?: any;
  expectedFields?: string[];
}

interface TestResult {
  api: ApiTest;
  status: 'pending' | 'testing' | 'success' | 'error';
  response?: any;
  error?: string;
  responseTime?: number;
  timestamp?: string;
  details?: {
    hasExpectedFields: boolean;
    missingFields: string[];
    responseStructure: any;
  };
}

export default function ApiTestingTool() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const apiList: ApiTest[] = [
    // Health Check APIs
    {
      name: 'Ping',
      path: '/api/ping',
      method: 'GET',
      description: 'Basic health check endpoint',
      expectedFields: ['message']
    },

    // Translator APIs
    {
      name: 'Baby Translator',
      path: '/api/baby-translator',
      method: 'POST',
      description: 'Analyzes baby cries or text descriptions',
      testPayload: { text: 'My baby is crying' },
      expectedFields: ['success', 'translated', 'original', 'confidence']
    },
    {
      name: 'Bad Translator',
      path: '/api/bad-translator',
      method: 'POST',
      description: 'Intentionally poor translation service',
      testPayload: { text: 'Hello world', sourceLanguage: 'en', targetLanguage: 'zh' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Cantonese Translator',
      path: '/api/cantonese-translator',
      method: 'POST',
      description: 'Cantonese Chinese translation service',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Gen Z Translator',
      path: '/api/gen-z-translator',
      method: 'POST',
      description: 'Gen Z slang translation service',
      testPayload: { text: 'This is amazing' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Yoda Translator',
      path: '/api/yoda-translator',
      method: 'POST',
      description: 'Yoda-style speech translator',
      testPayload: { text: 'May the Force be with you' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Pig Latin Translator',
      path: '/api/pig-latin-translator',
      method: 'POST',
      description: 'Pig Latin language translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },

    // Fantasy/Sci-fi Language Translators
    {
      name: 'Al-Bhed Translator',
      path: '/api/al-bhed-translator',
      method: 'POST',
      description: 'Final Fantasy Al-Bhed language translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Drow Translator',
      path: '/api/drow-translator',
      method: 'POST',
      description: 'Drow fantasy language translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'High Valyrian Translator',
      path: '/api/high-valyrian-translator',
      method: 'POST',
      description: 'Game of Thrones High Valyrian translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Mandalorian Translator',
      path: '/api/mandalorian-translator',
      method: 'POST',
      description: 'Star Wars Mandalorian translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },

    // Ancient/Historical Languages
    {
      name: 'Ancient Greek Translator',
      path: '/api/ancient-greek-translator',
      method: 'POST',
      description: 'Ancient Greek language translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Aramaic Translator',
      path: '/api/aramaic-translator',
      method: 'POST',
      description: 'Aramaic language translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Cuneiform Translator',
      path: '/api/cuneiform-translator',
      method: 'POST',
      description: 'Ancient cuneiform writing translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Middle English Translator',
      path: '/api/middle-english-translator',
      method: 'POST',
      description: 'Middle English language translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Nahuatl Translator',
      path: '/api/nahuatl-translator',
      method: 'POST',
      description: 'Nahuatl language translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Ogham Translator',
      path: '/api/ogham-translator',
      method: 'POST',
      description: 'Ogham ancient Irish script translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },

    // Creative/Generative APIs
    {
      name: 'Alien Text Generator',
      path: '/api/alien-text-generator',
      method: 'POST',
      description: 'Generates alien-style text',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Gibberish Translator',
      path: '/api/gibberish-translator',
      method: 'POST',
      description: 'Converts text to gibberish',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Verbose Generator',
      path: '/api/verbose-generator',
      method: 'POST',
      description: 'Makes text more verbose and elaborate',
      testPayload: { text: 'Simple idea' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Dumb It Down AI',
      path: '/api/dumb-it-down-ai',
      method: 'POST',
      description: 'Simplifies complex text',
      testPayload: { text: 'Quantum mechanics is the study of matter and energy at the molecular, atomic, nuclear, and even smaller microscopic levels.' },
      expectedFields: ['success', 'translated', 'original']
    },

    // Symbol/Cipher Translators
    {
      name: 'Baybayin Translator',
      path: '/api/baybayin-translator',
      method: 'POST',
      description: 'Filipino Baybayin script translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Gaster Translator',
      path: '/api/gaster-translator',
      method: 'POST',
      description: 'Wingdings-like symbol translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Rune Translator',
      path: '/api/rune-translator',
      method: 'POST',
      description: 'Runic symbol translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Runic Translator',
      path: '/api/runic-translator',
      method: 'POST',
      description: 'Alternative runic translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Wingdings Translator',
      path: '/api/wingdings-translator',
      method: 'POST',
      description: 'Wingdings font symbol translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },

    // Real World Language Translators
    {
      name: 'Albanian to English',
      path: '/api/albanian-to-english-translator',
      method: 'POST',
      description: 'Albanian to English translation',
      testPayload: { text: 'Përshëndetje botë' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Chinese to English',
      path: '/api/chinese-to-english-translator',
      method: 'POST',
      description: 'Chinese to English translation',
      testPayload: { text: '你好世界' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Creole to English',
      path: '/api/creole-to-english-translator',
      method: 'POST',
      description: 'Creole to English translation',
      testPayload: { text: 'Bonjou mond' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Esperanto Translator',
      path: '/api/esperanto-translator',
      method: 'POST',
      description: 'Esperanto language translator',
      testPayload: { text: 'Saluton mondo' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Greek Translator',
      path: '/api/greek-translator',
      method: 'POST',
      description: 'Greek language translator',
      testPayload: { text: 'Γεια σου κόσμε' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Japanese to English',
      path: '/api/japanese-to-english-translator',
      method: 'POST',
      description: 'Japanese to English translation',
      testPayload: { text: 'こんにちは世界' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Manga Translator',
      path: '/api/manga-translator',
      method: 'POST',
      description: 'Manga-style translation',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Samoan to English',
      path: '/api/samoan-to-english-translator',
      method: 'POST',
      description: 'Samoan to English translation',
      testPayload: { text: 'Malo lelei lalolagi' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Swahili to English',
      path: '/api/swahili-to-english-translator',
      method: 'POST',
      description: 'Swahili to English translation',
      testPayload: { text: 'Habari dunia' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Telugu to English',
      path: '/api/telugu-to-english-translator',
      method: 'POST',
      description: 'Telugu to English translation',
      testPayload: { text: 'హలో ప్రపంచం' },
      expectedFields: ['success', 'translated', 'original']
    },

    // English to Other Languages
    {
      name: 'English to Amharic',
      path: '/api/english-to-amharic-translator',
      method: 'POST',
      description: 'English to Amharic translation',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'English to Chinese',
      path: '/api/english-to-chinese-translator',
      method: 'POST',
      description: 'English to Chinese translation',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'English to Persian',
      path: '/api/english-to-persian-translator',
      method: 'POST',
      description: 'English to Persian translation',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'English to Polish',
      path: '/api/english-to-polish-translator',
      method: 'POST',
      description: 'English to Polish translation',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'English to Swahili',
      path: '/api/english-to-swahili-translator',
      method: 'POST',
      description: 'English to Swahili translation',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },

    // Specialized Translators
    {
      name: 'Dog Translator',
      path: '/api/dog-translator',
      method: 'POST',
      description: 'Dog communication translator',
      testPayload: { text: 'My dog is barking' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Gen Alpha Translator',
      path: '/api/gen-alpha-translator',
      method: 'POST',
      description: 'Gen Alpha slang translator',
      testPayload: { text: 'This is very cool' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'IVR Translator',
      path: '/api/ivr-translator',
      method: 'POST',
      description: 'Interactive Voice Response translator',
      testPayload: { text: 'Press 1 for sales' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Minion Translator',
      path: '/api/minion-translator',
      method: 'POST',
      description: 'Minion language translator',
      testPayload: { text: 'Hello world' },
      expectedFields: ['success', 'translated', 'original']
    },

    // Core Translation APIs
    {
      name: 'Translate API',
      path: '/api/translate',
      method: 'POST',
      description: 'Core translation API',
      testPayload: { text: 'Hello world', sourceLanguage: 'en', targetLanguage: 'zh' },
      expectedFields: ['success', 'translated', 'original']
    },
    {
      name: 'Translate Unified',
      path: '/api/translate-unified',
      method: 'POST',
      description: 'Unified translation API',
      testPayload: { text: 'Hello world', sourceLanguage: 'en', targetLanguage: 'zh' },
      expectedFields: ['success', 'translated', 'original']
    },
  ];

  const categories = [
    { id: 'all', label: 'All APIs', count: apiList.length },
    { id: 'health', label: 'Health Check', count: 1 },
    { id: 'basic', label: 'Basic Translators', count: 6 },
    { id: 'fantasy', label: 'Fantasy Languages', count: 4 },
    { id: 'ancient', label: 'Ancient Languages', count: 6 },
    { id: 'creative', label: 'Creative APIs', count: 4 },
    { id: 'symbols', label: 'Symbol Translators', count: 5 },
    { id: 'realworld', label: 'Real World Languages', count: 10 },
    { id: 'specialized', label: 'Specialized', count: 9 },
    { id: 'core', label: 'Core APIs', count: 2 },
  ];

  const filterApis = () => {
    if (selectedCategory === 'all') return apiList;

    const categoryMap: Record<string, string[]> = {
      health: ['Ping'],
      basic: ['Baby Translator', 'Bad Translator', 'Cantonese Translator', 'Gen Z Translator', 'Yoda Translator', 'Pig Latin Translator'],
      fantasy: ['Al-Bhed Translator', 'Drow Translator', 'High Valyrian Translator', 'Mandalorian Translator'],
      ancient: ['Ancient Greek Translator', 'Aramaic Translator', 'Cuneiform Translator', 'Middle English Translator', 'Nahuatl Translator', 'Ogham Translator'],
      creative: ['Alien Text Generator', 'Gibberish Translator', 'Verbose Generator', 'Dumb It Down AI'],
      symbols: ['Baybayin Translator', 'Gaster Translator', 'Rune Translator', 'Runic Translator', 'Wingdings Translator'],
      realworld: ['Albanian to English', 'Chinese to English', 'Creole to English', 'Esperanto Translator', 'Greek Translator', 'Japanese to English', 'Manga Translator', 'Samoan to English', 'Swahili to English', 'Telugu to English'],
      specialized: ['English to Amharic', 'English to Chinese', 'English to Persian', 'English to Polish', 'English to Swahili', 'Dog Translator', 'Gen Alpha Translator', 'IVR Translator', 'Minion Translator'],
      core: ['Translate API', 'Translate Unified'],
    };

    return apiList.filter(api => categoryMap[selectedCategory]?.includes(api.name) || false);
  };

  const testSingleApi = async (api: ApiTest): Promise<TestResult> => {
    const startTime = Date.now();

    try {
      const response = await fetch(api.path, {
        method: api.method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(api.testPayload && { body: JSON.stringify(api.testPayload) }),
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      // Check if response has expected fields
      const hasExpectedFields = api.expectedFields?.every(field =>
        typeof responseData === 'object' && responseData !== null && field in responseData
      ) ?? true;

      const missingFields = api.expectedFields?.filter(field =>
        !(typeof responseData === 'object' && responseData !== null && field in responseData)
      ) ?? [];

      return {
        api,
        status: response.ok ? 'success' : 'error',
        response: responseData,
        responseTime,
        timestamp: new Date().toISOString(),
        details: {
          hasExpectedFields,
          missingFields,
          responseStructure: responseData
        }
      };
    } catch (error) {
      return {
        api,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  };

  const testAllApis = async () => {
    setIsTestingAll(true);
    const filteredApis = filterApis();
    const initialResults = filteredApis.map(api => ({
      api,
      status: 'pending' as const
    }));
    setTestResults(initialResults);

    for (let i = 0; i < filteredApis.length; i++) {
      const api = filteredApis[i];

      setTestResults(prev => {
        const newResults = [...prev];
        newResults[i] = { ...newResults[i], status: 'testing' };
        return newResults;
      });

      const result = await testSingleApi(api);

      setTestResults(prev => {
        const newResults = [...prev];
        newResults[i] = result;
        return newResults;
      });

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsTestingAll(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (result: TestResult) => {
    if (result.status === 'success') {
      if (result.details?.hasExpectedFields) {
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      } else {
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      }
    }

    return <Badge variant="destructive">Error</Badge>;
  };

  const filteredApis = filterApis();
  const successCount = testResults.filter(r => r.status === 'success').length;
  const warningCount = testResults.filter(r => r.status === 'success' && !r.details?.hasExpectedFields).length;
  const errorCount = testResults.filter(r => r.status === 'error').length;

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Testing Tool</h1>
        <p className="text-muted-foreground">
          Test all API endpoints for connectivity and response validation
        </p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Overview</CardTitle>
            <CardDescription>
              {testResults.length > 0 && (
                <div className="flex gap-4 mt-2">
                  <span className="text-green-600">Success: {successCount}</span>
                  <span className="text-yellow-600">Warnings: {warningCount}</span>
                  <span className="text-red-600">Errors: {errorCount}</span>
                  <span className="text-gray-600">Total: {testResults.length}</span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
                <TabsList className="grid w-full grid-cols-5">
                  {categories.map(category => (
                    <TabsTrigger key={category.id} value={category.id} className="text-xs">
                      {category.label} ({category.count})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Button
                onClick={testAllApis}
                disabled={isTestingAll}
                className="min-w-32"
              >
                {isTestingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Test All ({filteredApis.length})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="font-semibold">{result.api.name}</h3>
                      <p className="text-sm text-muted-foreground">{result.api.description}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{result.api.method}</Badge>
                        <Badge variant="outline">{result.api.path}</Badge>
                        {getStatusBadge(result)}
                      </div>
                    </div>
                  </div>

                  {result.responseTime && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{result.responseTime}ms</div>
                      <div className="text-xs text-muted-foreground">
                        {result.timestamp && new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>

                {result.api.testPayload && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">Test Payload:</div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.api.testPayload, null, 2)}
                    </pre>
                  </div>
                )}

                {result.status === 'error' && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-red-700">Error</span>
                    </div>
                    <div className="text-sm text-red-600">{result.error}</div>
                  </div>
                )}

                {result.status === 'success' && result.response && (
                  <div className="space-y-3">
                    {result.details && !result.details.hasExpectedFields && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-yellow-700">Missing Expected Fields</span>
                        </div>
                        <div className="text-sm text-yellow-600">
                          Missing: {result.details.missingFields.join(', ')}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-medium mb-1">Response:</div>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-64">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}