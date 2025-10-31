/**
 * 简化的翻译器配置 - 减少bundle大小
 */

export const translatorConfigs = {
  'chinese-english': {
    id: 'chinese-english',
    name: 'Chinese-English Translator',
    modes: ['general'],
    defaultMode: 'general',
  },
  'japanese-english': {
    id: 'japanese-english',
    name: 'Japanese-English Translator',
    modes: ['general'],
    defaultMode: 'general',
  },
  'albanian-english': {
    id: 'albanian-english',
    name: 'Albanian-English Translator',
    modes: ['general'],
    defaultMode: 'general',
  },
};

export function getTranslatorConfig(id: string) {
  return translatorConfigs[id] || null;
}
