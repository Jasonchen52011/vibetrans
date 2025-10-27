import { websiteConfig } from './config/website';

/**
 * The routes for the application (Optimized version)
 */
export enum Routes {
  Root = '/',

  // marketing pages
  FAQ = '/faq',
  Features = '/features',
  Pricing = '/pricing', // change to /#pricing if you want to use pricing section in homepage
  Blog = '/blog',
  Docs = '/docs',
  About = '/about',
  Contact = '/contact',
  Waitlist = '/waitlist',
  Changelog = '/changelog',
  Roadmap = '/roadmap',
  CookiePolicy = '/cookie',
  PrivacyPolicy = '/privacy',
  TermsOfService = '/terms',

  // auth routes
  Login = '/auth/login',
  Register = '/auth/register',
  AuthError = '/auth/error',
  ForgotPassword = '/auth/forgot-password',
  ResetPassword = '/auth/reset-password',

  // dashboard routes
  Dashboard = '/dashboard',
  AdminUsers = '/admin/users',
  SettingsProfile = '/settings/profile',
  SettingsBilling = '/settings/billing',
  SettingsCredits = '/settings/credits',
  SettingsSecurity = '/settings/security',
  SettingsNotifications = '/settings/notifications',

  // payment processing
  Payment = '/payment',

  // AI routes
  AIText = '/ai/text',
  AIImage = '/ai/image',
  AIChat = '/ai/chat',
  AIVideo = '/ai/video',
  AIAudio = '/ai/audio',

  // Core Fun Tools routes (optimized)
  DumbItDownAI = '/dumb-it-down-ai',
  VerboseGenerator = '/verbose-generator',

  // Core Game Translator routes (optimized)
  AlBhedTranslator = '/al-bhed-translator',
  DrowTranslator = '/drow-translator',
  GasterTranslator = '/gaster-translator',
  HighValyrianTranslator = '/high-valyrian-translator',
  MandalorianTranslator = '/mandalorian-translator',
  MinionTranslator = '/minion-translator',
  RuneTranslator = '/rune-translator',
  RunicTranslator = '/runic-translator',
  WingdingsTranslator = '/wingdings-translator',
  YodaTranslator = '/yoda-translator',

  // Core Language Translator routes (optimized)
  AlbanianToEnglish = '/albanian-to-english',
  AncientGreekTranslator = '/ancient-greek-translator',
  AramaicTranslator = '/aramaic-translator',
  BaybayinTranslator = '/baybayin-translator',
  CantoneseTranslator = '/cantonese-translator',
  ChineseToEnglishTranslator = '/chinese-to-english-translator',
  CreoleToEnglishTranslator = '/creole-to-english-translator',
  CuneiformTranslator = '/cuneiform-translator',
  EnglishToAmharicTranslator = '/english-to-amharic-translator',
  EnglishToChineseTranslator = '/english-to-chinese-translator',
  EnglishToPersianTranslator = '/english-to-persian-translator',
  EnglishToPolishTranslator = '/english-to-polish-translator',
  EnglishToSwahiliTranslator = '/english-to-swahili-translator',
  EsperantoTranslator = '/esperanto-translator',
  GreekTranslator = '/greek-translator',
  IvrTranslator = '/ivr-translator',
  JapaneseToEnglishTranslator = '/japanese-to-english-translator',
  MangaTranslator = '/manga-translator',
  MiddleEnglishTranslator = '/middle-english-translator',
  NahuatlTranslator = '/nahuatl-translator',
  OghamTranslator = '/ogham-translator',
  SamoanToEnglishTranslator = '/samoan-to-english-translator',
  SwahiliToEnglishTranslator = '/swahili-to-english-translator',
  TeluguToEnglishTranslator = '/telugu-to-english-translator',

  // Additional routes for navbar compatibility
  AlienTextGenerator = '/alien-text-generator',
  BabyTranslator = '/baby-translator',
  BadTranslator = '/bad-translator',
  DogTranslator = '/dog-translator',
  GenAlphaTranslator = '/gen-alpha-translator',
  GenZTranslator = '/gen-z-translator',
  GibberishTranslator = '/gibberish-translator',
  PigLatinTranslator = '/pig-latin-translator',

  // block routes
  MagicuiBlocks = '/magicui',
  HeroBlocks = '/blocks/hero-section',
  LogoCloudBlocks = '/blocks/logo-cloud',
  FeaturesBlocks = '/blocks/features',
  IntegrationsBlocks = '/blocks/integrations',
  ContentBlocks = '/blocks/content',
  StatsBlocks = '/blocks/stats',
  TeamBlocks = '/blocks/team',
  TestimonialsBlocks = '/blocks/testimonials',
  CallToActionBlocks = '/blocks/call-to-action',
  FooterBlocks = '/blocks/footer',
  PricingBlocks = '/blocks/pricing',
  ComparatorBlocks = '/blocks/comparator',
  FAQBlocks = '/blocks/faqs',
  LoginBlocks = '/blocks/login',
  SignupBlocks = '/blocks/sign-up',
  ForgotPasswordBlocks = '/blocks/forgot-password',
  ContactBlocks = '/blocks/contact',
}

/**
 * The routes that can not be accessed by logged in users
 */
export const routesNotAllowedByLoggedInUsers = [Routes.Login, Routes.Register];

/**
 * The routes that are protected and require authentication
 */
export const protectedRoutes = [
  Routes.Dashboard,
  Routes.AdminUsers,
  Routes.SettingsProfile,
  Routes.SettingsBilling,
  Routes.SettingsCredits,
  Routes.SettingsSecurity,
  Routes.SettingsNotifications,
  Routes.Payment,
];

/**
 * The default redirect path after logging in
 */
export const DEFAULT_LOGIN_REDIRECT =
  websiteConfig.routes.defaultLoginRedirect ?? Routes.Dashboard;