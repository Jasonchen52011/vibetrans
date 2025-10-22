'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { useLocale, useTranslations } from 'next-intl';

interface AiTool {
  title: string;
  description: string;
  image: string;
  link: string;
}

// 组件参数类型定义
interface ExploreOurAiToolsProps {
  toolKeys?: string[]; // 页面传递工具的英文键数组
  toolNames?: string[]; // 向后兼容的参数名
}

export default function ExploreOurAiTools({
  toolKeys,
  toolNames,
}: ExploreOurAiToolsProps) {
  // @ts-ignore - Dynamic translation keys
  const t = useTranslations('exploreAiTools');
  const locale = useLocale();
  // 在组件内部维护所有工具的完整数据（仅保留图片和链接，标题和描述从翻译中获取）
  const allToolsData: Record<string, { image: string; link: string }> = {
    // Translator Tools
    'Gen Z Translator': {
      link: '/gen-z-translator',
      image: '/images/docs/what-is-gen-z-translator.webp',
    },
    'Dog Translator': {
      link: '/dog-translator',
      image: '/images/docs/what-is-dog-translator.webp',
    },
    'Bad Translator': {
      link: '/bad-translator',
      image: '/images/docs/what-is-bad-translator.webp',
    },
    'Ancient Greek Translator': {
      link: '/ancient-greek-translator',
      image: '/images/docs/what-is-ancient-greek-translator.webp',
    },
    'Gibberish Translator': {
      link: '/gibberish-translator',
      image: '/images/docs/gibberish-education-purpose.webp',
    },
    'Esperanto Translator': {
      link: '/esperanto-translator',
      image: '/images/docs/esperanto-voice-features.webp',
    },
    'Gen Alpha Translator': {
      link: '/gen-alpha-translator',
      image: '/images/docs/translation-slang.webp',
    },
    'Cuneiform Translator': {
      link: '/cuneiform-translator',
      image: '/images/docs/cuneiform-translator-how.webp',
    },
    'Al Bhed Translator': {
      link: '/al-bhed-translator',
      image: '/images/docs/al-bhed-translator-what-is.webp',
    },
    'Baby Translator': {
      link: '/baby-translator',
      image: '/images/docs/what-is-baby-translator.webp',
    },
    'Alien Text Generator': {
      link: '/alien-text-generator',
      image: '/images/docs/what-is-alien-text-generator.webp',
    },
    // Dog Tools
    'Dog Name Generator': {
      link: '/dog-name-generator',
      image: '/images/page/dognamegenerator.webp',
    },
    'Dog Calorie Calculator': {
      link: '/dog-calorie-calculator',
      image: '/images/page/dogcalorie.webp',
    },
    'Dog Breed Identifier with AI': {
      link: 'https://breed.dog/',
      image: '/images/page/breeddograndombreedhowto.webp',
    },
    'Dog Age Calculator': {
      link: '/dog-age-calculator',
      image: '/images/page/dog-age-calculator.webp',
    },
    'Random Dog Breed Generator': {
      link: '/random-dog-breed-generator',
      image: '/images/page/random-dog-breed-generator.webp',
    },
    'Dog Breed Quiz': {
      link: '/dog-breed-quiz',
      image: '/images/page/dog-breed-quiz.webp',
    },
    'What Dog Breed Am I?': {
      link: '/what-dog-breed-am-i',
      image: '/images/page/whatdogbreedami.webp',
    },
    'Dog Weight Calculator': {
      link: '/dog-weight-calculator',
      image: '/images/page/dog-weight-hero.webp',
    },
    'Dog Translator Online': {
      link: '/dog-translator',
      image: '/images/page/dogtranslation.webp',
    },
    'Dog Bite Settlement Calculator': {
      link: '/dog-bite-settlement-calculator',
      image: '/images/page/dog-bite-settlement-calculator.webp',
    },
    'Dog Chocolate Toxicity Calculator': {
      link: '/dog-chocolate-toxicity-calculator',
      image: '/images/page/dog-chocolate-toxicity-calculator.webp',
    },
    'Dog Onion Toxicity Calculator': {
      link: '/dog-onion-toxicity-calculator',
      image: '/images/page/dog-onion-toxicity-calculator-hero.webp',
    },
    'Dog Grape Toxicity Calculator': {
      link: '/dog-grape-toxicity-calculator',
      image: '/images/page/dog-grape-toxicity-calculator.webp',
    },
    'Dog Pregnancy Calculator': {
      link: '/dog-pregnancy-calculator',
      image: '/images/page/dog-pregnancy-calculator-online.webp',
    },
    'Dog Heat Cycle Calculator': {
      link: '/dog-heat-cycle-calculator',
      image: '/images/page/dog-heat-cycle-calculator-how-to.webp',
    },
    'Dog Water Intake Calculator': {
      link: '/dog-water-intake-calculator',
      image: '/images/page/dog-water-intake-calculator.webp',
    },
    'Dog Food Calculator': {
      link: '/dog-food-calculator',
      image: '/images/page/dog-food-calculator-hero.webp',
    },
    'Homemade Dog Food Calculator': {
      link: '/homemade-dog-food-calculator',
      image: '/images/page/homemade-dog-food-calculator.webp',
    },
    'Raw Dog Food Calculator': {
      link: '/raw-dog-food-calculator',
      image: '/images/page/raw-dog-food-calculator.webp',
    },
    'Dog Lap Day Calculator': {
      link: '/dog-lap-day-calculator',
      image: '/images/page/dog-lap-day-calculator.webp',
    },
    'Guess the Dog Breed': {
      link: '/guess-the-dog-breed',
      image: '/images/page/guess-the-dog-breed1.webp',
    },
  };

  // 根据传入的工具键过滤出要显示的工具，从翻译中获取标题和描述
  const keysToUse = toolKeys || toolNames || [];
  const toolsToDisplay = keysToUse
    .map((key) => {
      const toolData = allToolsData[key];
      if (!toolData) {
        console.warn(`Tool data not found for: ${key}`);
        return null;
      }

      return {
        // @ts-ignore - Dynamic translation keys
        title: t(`tools.${key}.title`),
        // @ts-ignore - Dynamic translation keys
        description: t(`tools.${key}.description`),
        image: toolData.image,
        link: toolData.link.startsWith('http')
          ? `${toolData.link}${locale}`
          : `/${locale}${toolData.link}`,
      };
    })
    .filter(Boolean) as AiTool[];

  return (
    <section className="max-w-7xl mx-auto mt-16 mb-10">
      <div className="bg-surface-light rounded-3xl p-4">
        <div className="text-center mb-8">
          <HeaderSection
            title={t('title')}
            description={t('description')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
          {toolsToDisplay.map((tool, index) => (
            <a
              key={index}
              href={tool.link}
              className="bg-white/50 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-primary-light/20 cursor-pointer group block"
            >
              <div className="relative h-40 mt-4 group-hover:opacity-90 transition-opacity">
                <img
                  src={tool.image}
                  alt={tool.title}
                  width="320"
                  height="160"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-lg">{tool.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
