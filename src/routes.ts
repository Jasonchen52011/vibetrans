import { websiteConfig } from './config/website';

/**
 * The routes for the application
 */
export enum Routes {
  Root = '/',

  // marketing pages
  FAQ = '/#faq',
  Features = '/#features',
  Pricing = '/pricing', // change to /#pricing if you want to use the pricing section in homepage
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

  // Fun Tools routes
  DogTranslator = '/dog-translator',
  GenZTranslator = '/gen-z-translator',
  GenAlphaTranslator = '/gen-alpha-translator',
  DumbItDownAI = '/dumb-it-down-ai',
  BadTranslator = '/bad-translator',
  BabyTranslator = '/baby-translator',
  GibberishTranslator = '/gibberish-translator',
  AncientGreekTranslator = '/ancient-greek-translator',
  AlBhedTranslator = '/al-bhed-translator',
  AlienTextGenerator = '/alien-text-generator',
  EsperantoTranslator = '/esperanto-translator',
  CuneiformTranslator = '/cuneiform-translator',
  VerboseGenerator = '/verbose-generator',
  IvrTranslator = '/ivr-translator',
  AlbanianToEnglish = '/albanian-to-english',
  CreoleToEnglishTranslator = '/creole-to-english-translator',
  PigLatinTranslator = '/pig-latin-translator',
  CantoneseTranslator = '/cantonese-translator',
  ChineseToEnglishTranslator = '/chinese-to-english-translator',
  EnglishToChineseTranslator = '/english-to-chinese-translator',
  MiddleEnglishTranslator = '/middle-english-translator',
  MinionTranslator = '/minion-translator',
  BaybayinTranslator = '/baybayin-translator',
  SamoanToEnglishTranslator = '/samoan-to-english-translator',
  GasterTranslator = '/gaster-translator',
  HighValyrianTranslator = '/high-valyrian-translator',
  AramaicTranslator = '/aramaic-translator',

  // Additional translator routes
  RuneTranslator = '/rune-translator',
  EnglishToSwahiliTranslator = '/english-to-swahili-translator',
  NahuatlTranslator = '/nahuatl-translator',
  EnglishToAmharicTranslator = '/english-to-amharic-translator',
  RunicTranslator = '/runic-translator',
  DrowTranslator = '/drow-translator',
  SwahiliToEnglishTranslator = '/swahili-to-english-translator',
  EnglishToPolishTranslator = '/english-to-polish-translator',
  OghamTranslator = '/ogham-translator',
  TeluguToEnglishTranslator = '/telugu-to-english-translator',
  YodaTranslator = '/yoda-translator',
  MandalorianTranslator = '/mandalorian-translator',
  WingdingsTranslator = '/wingdings-translator',
  GreekTranslator = '/greek-translator',
  MangaTranslator = '/manga-translator',
    EnglishToPersianTranslator = '/english-to-persian-translator',

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
