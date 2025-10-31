'use client';

import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import { RoutePreloader } from '@/components/layout/route-preloader';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useNavbarLinks } from '@/config/navbar-config';
import { useScroll } from '@/hooks/use-scroll';
import { LocaleLink, useLocalePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ArrowUpRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useState,
} from 'react';
import LocaleSwitcher from './locale-switcher';

// 翻译器页面模式映射表
const TRANSLATOR_PAGE_PATTERNS = {
  '/minion-translator': 'MinionTranslatorPage',
  '/al-bhed-translator': 'AlBhedTranslatorPage',
  '/albanian-to-english': 'AlbanianToEnglishPage',
  '/alien-text-generator': 'AlienTextGeneratorPage',
  '/ancient-greek-translator': 'AncientGreekTranslatorPage',
  '/aramaic-translator': 'AramaicTranslatorPage',
  '/baby-translator': 'BabyTranslatorPage',
  '/bad-translator': 'BadTranslatorPage',
  '/baybayin-translator': 'BaybayinTranslatorPage',
  '/chinese-to-english-translator': 'ChineseToEnglishTranslatorPage',
  '/creole-to-english-translator': 'CreoleToEnglishTranslatorPage',
  '/cuneiform-translator': 'CuneiformTranslatorPage',
  '/drow-translator': 'DrowTranslatorPage',
  '/dumb-it-down-ai': 'DumbItDownPage',
  '/english-to-amharic-translator': 'EnglishToAmharicTranslatorPage',
  '/english-to-chinese-translator': 'EnglishToChineseTranslatorPage',
  '/english-to-persian-translator': 'EnglishToPersianTranslatorPage',
  '/english-to-polish-translator': 'EnglishToPolishTranslatorPage',
  '/english-to-swahili-translator': 'EnglishToSwahiliTranslatorPage',
  '/esperanto-translator': 'EsperantoTranslatorPage',
  '/gaster-translator': 'GasterTranslatorPage',
  '/gen-alpha-translator': 'GenAlphaTranslatorPage',
  '/gen-z-translator': 'GenZTranslatorPage',
  '/gibberish-translator': 'GibberishTranslatorPage',
  '/greek-translator': 'GreekTranslatorPage',
  '/high-valyrian-translator': 'HighValyrianTranslatorPage',
  '/ivr-translator': 'IvrTranslatorPage',
  '/japanese-to-english-translator': 'JapaneseToEnglishTranslatorPage',
  '/mandalorian-translator': 'MandalorianTranslatorPage',
  '/manga-translator': 'MangaTranslatorPage',
  '/middle-english-translator': 'MiddleEnglishTranslatorPage',
  '/nahuatl-translator': 'NahuatlTranslatorPage',
  '/ogham-translator': 'OghamTranslatorPage',
  '/pig-latin-translator': 'PigLatinTranslatorPage',
  '/rune-translator': 'RuneTranslatorPage',
  '/runic-translator': 'RunicTranslatorPage',
  '/samoan-to-english-translator': 'SamoanToEnglishTranslatorPage',
  '/swahili-to-english-translator': 'SwahiliToEnglishTranslatorPage',
  '/telugu-to-english-translator': 'TeluguToEnglishTranslatorPage',
  '/verbose-generator': 'VerboseGeneratorPage',
  '/wingdings-translator': 'WingdingsTranslatorPage',
  '/yoda-translator': 'YodaTranslatorPage',
};

/**
 * 检测当前路径是否为翻译器页面并返回对应的翻译键名
 */
function detectTranslatorPage(pathname: string): string | null {
  if (!pathname || pathname === '/') return null;

  // 过滤掉静态资源路径，确保图片URL不会被误认为是页面路径
  if (
    pathname.startsWith('/images/') ||
    pathname.startsWith('/assets/') ||
    (pathname.includes('.') &&
      (pathname.endsWith('.webp') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.gif') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.js')))
  ) {
    return null;
  }

  // 移除locale前缀和查询参数
  const pathWithoutLocale = pathname
    .replace(/^\/zh\//, '/')
    .replace(/^\/([a-z]{2})\//, '/')
    .split('?')[0];

  // 直接匹配翻译器页面
  return (
    TRANSLATOR_PAGE_PATTERNS[
      pathWithoutLocale as keyof typeof TRANSLATOR_PAGE_PATTERNS
    ] || null
  );
}

interface NavBarProps {
  scroll?: boolean;
}

const customNavigationMenuTriggerStyle = cn(
  navigationMenuTriggerStyle(),
  'relative bg-transparent text-muted-foreground cursor-pointer',
  'hover:bg-accent hover:text-accent-foreground',
  'focus:bg-accent focus:text-accent-foreground',
  'data-active:font-semibold data-active:bg-transparent data-active:text-accent-foreground',
  'data-[state=open]:bg-transparent data-[state=open]:text-accent-foreground'
);

export function Navbar({ scroll }: NavBarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { isScrolled, isScrollingUp, hideNavbar, scrollY } = useScroll(50);
  const menuLinks = useNavbarLinks();
  const localePathname = useLocalePathname();
  const [activeMenu, setActiveMenu] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    // 新增：翻译预加载逻辑
    const preloadTranslations = async () => {
      // 检测当前路由是否为翻译器页面
      const currentPath = localePathname.replace(/^\/[a-z]{2}\//, '/');
      const translatorKey = detectTranslatorPage(currentPath);

      if (translatorKey) {
        try {
          // 动态导入并预加载翻译文件
          const { getMessagesForLocale } = await import('@/i18n/messages');
          await getMessagesForLocale(locale, {
            pathname: currentPath,
            translatorKey,
            includeCommon: true,
          });
          console.log(
            `✅ [Navbar] Preloaded translations for: ${translatorKey}`
          );
        } catch (error) {
          console.warn(`⚠️ [Navbar] Failed to preload translations:`, error);
        }
      }
    };

    // 延迟执行预加载，避免影响导航性能
    const timeoutId = setTimeout(preloadTranslations, 100);

    // Cleanup timeout on unmount
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
      clearTimeout(timeoutId);
    };
  }, [closeTimeout, localePathname, locale]);

  const getPointerOpenHandler = (value: string) => {
    return (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'touch') {
        return;
      }
      // Clear any existing close timeout when opening a menu
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        setCloseTimeout(null);
      }
      setActiveMenu(value);
    };
  };

  const handlePointerClose = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      return;
    }
    // Clear any existing timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
    // Add small delay to prevent accidental closing when moving between menu items
    const timeout = setTimeout(() => {
      setActiveMenu(undefined);
      setCloseTimeout(null);
    }, 150);
    setCloseTimeout(timeout);
  };

  return (
    <>
      {/* Route preloader for better navigation performance */}
      <RoutePreloader />

      <section
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-in-out',
          // 磁吸效果 - 根据滚动状态调整transform
          hideNavbar
            ? '-translate-y-full' // 隐藏navbar
            : scrollY > 100
              ? 'translate-y-0' // 磁吸在顶部
              : 'translate-y-0', // 初始位置

          // 背景和边框效果
          scroll
            ? isScrolled
              ? 'bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg'
              : 'bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100/30 dark:border-gray-800/30'
            : 'bg-transparent',

          // 滚动时的特殊效果
          isScrollingUp && !hideNavbar && 'shadow-2xl'
        )}
        style={{
          // 平滑过渡效果
          transitionProperty: 'transform, background-color, backdrop-filter, border-color, box-shadow',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: hideNavbar ? '300ms' : '500ms'
        }}
      >
        <Container className="px-4 h-16">
          {/* desktop navbar */}
          <nav className="hidden lg:flex lg:items-center lg:w-full h-full">
            {/* logo and name */}
            <div className="flex items-center mr-8">
              <LocaleLink href="/" className="flex items-center space-x-2">
                <Logo />
                <span className="text-xl font-semibold">
                  {t('Metadata.name')}
                </span>
              </LocaleLink>
            </div>

            {/* menu links */}
            <div
              className="flex items-center space-x-2 flex-1 relative z-50"
              onPointerLeave={handlePointerClose}
            >
              <NavigationMenu
                className="relative"
                viewport={false}
                value={activeMenu}
              >
                <NavigationMenuList className="flex items-center">
                  {menuLinks?.map((item, index) =>
                    item.items ? (
                      <NavigationMenuItem
                        key={index}
                        className="relative"
                        value={`menu-${index}`}
                        onPointerEnter={getPointerOpenHandler(`menu-${index}`)}
                        onPointerMove={getPointerOpenHandler(`menu-${index}`)}
                        onPointerLeave={handlePointerClose}
                      >
                        <NavigationMenuTrigger
                          data-active={
                            item.items.some((subItem) =>
                              subItem.href
                                ? localePathname.startsWith(subItem.href)
                                : false
                            )
                              ? 'true'
                              : undefined
                          }
                          className={customNavigationMenuTriggerStyle}
                        >
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent
                          className={cn(
                            index === menuLinks.length - 1
                              ? 'left-auto right-0'
                              : 'left-0 right-auto'
                          )}
                        >
                          <ul
                            className={cn(
                              'grid gap-2 p-3',
                              item.items && item.items.length === 1
                                ? 'w-[280px] max-w-[calc(100vw-4rem)]'
                                : 'w-[500px] md:w-[700px] md:grid-cols-3 lg:w-[900px] lg:grid-cols-4 max-w-[calc(100vw-4rem)]'
                            )}
                          >
                            {item.items?.map((subItem, subIndex) => {
                              const isSubItemActive =
                                subItem.href &&
                                localePathname.startsWith(subItem.href);
                              return (
                                <li key={subIndex}>
                                  <NavigationMenuLink asChild>
                                    <LocaleLink
                                      href={subItem.href || '#'}
                                      target={
                                        subItem.external ? '_blank' : undefined
                                      }
                                      rel={
                                        subItem.external
                                          ? 'noopener noreferrer'
                                          : undefined
                                      }
                                      className={cn(
                                        'group flex flex-row items-center gap-3 rounded-md',
                                        'p-1.5 leading-none no-underline outline-hidden transition-colors',
                                        'hover:bg-accent hover:text-accent-foreground',
                                        'focus:bg-accent focus:text-accent-foreground',
                                        isSubItemActive &&
                                          'bg-accent text-accent-foreground'
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          'flex size-8 shrink-0 items-center justify-center transition-colors',
                                          'bg-transparent text-muted-foreground',
                                          'group-hover:bg-transparent group-hover:text-accent-foreground',
                                          'group-focus:bg-transparent group-focus:text-accent-foreground',
                                          isSubItemActive &&
                                            'bg-transparent text-accent-foreground'
                                        )}
                                      >
                                        {subItem.icon ? subItem.icon : null}
                                      </div>
                                      <div className="flex-1">
                                        <div
                                          className={cn(
                                            'text-sm font-medium text-muted-foreground',
                                            'group-hover:bg-transparent group-hover:text-accent-foreground',
                                            'group-focus:bg-transparent group-focus:text-accent-foreground',
                                            isSubItemActive &&
                                              'bg-transparent text-accent-foreground'
                                          )}
                                        >
                                          {subItem.title}
                                        </div>
                                        {subItem.description && (
                                          <div
                                            className={cn(
                                              'text-sm text-muted-foreground',
                                              'group-hover:bg-transparent group-hover:text-accent-foreground/80',
                                              'group-focus:bg-transparent group-focus:text-accent-foreground/80',
                                              isSubItemActive &&
                                                'bg-transparent text-accent-foreground/80'
                                            )}
                                          >
                                            {subItem.description}
                                          </div>
                                        )}
                                      </div>
                                      {subItem.external && (
                                        <ArrowUpRightIcon
                                          className={cn(
                                            'size-4 shrink-0 text-muted-foreground',
                                            'group-hover:bg-transparent group-hover:text-accent-foreground',
                                            'group-focus:bg-transparent group-focus:text-accent-foreground',
                                            isSubItemActive &&
                                              'bg-transparent text-accent-foreground'
                                          )}
                                        />
                                      )}
                                    </LocaleLink>
                                  </NavigationMenuLink>
                                </li>
                              );
                            })}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    ) : (
                      <NavigationMenuItem key={index}>
                        <NavigationMenuLink
                          asChild
                          active={
                            item.href
                              ? item.href === '/'
                                ? localePathname === '/'
                                : localePathname.startsWith(item.href)
                              : false
                          }
                          className={customNavigationMenuTriggerStyle}
                        >
                          <LocaleLink
                            href={item.href || '#'}
                            target={item.external ? '_blank' : undefined}
                            rel={
                              item.external ? 'noopener noreferrer' : undefined
                            }
                          >
                            {item.title}
                          </LocaleLink>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* navbar right - only theme switcher */}
            <div className="flex items-center gap-x-4 ml-8">
              <ModeSwitcher />
              {/* <LocaleSwitcher /> */}
            </div>
          </nav>

          {/* mobile navbar */}
          <NavbarMobile className="lg:hidden" />
        </Container>
      </section>
    </>
  );
}
