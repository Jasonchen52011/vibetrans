import type { WebsiteConfig } from '@/types';

/**
 * website config, without translations
 */
export const websiteConfig: WebsiteConfig = {
  ui: {
    theme: {
      defaultTheme: 'default',
      enableSwitch: true,
    },
    mode: {
      defaultMode: 'light',
      enableSwitch: false,
    },
  },
  metadata: {
    images: {
      ogImage: '/images/docs/what-is-vibetrans.webp',
      logoLight: '/vibetrans-icon.png',
      logoDark: '/vibetrans-icon.png',
    },
    social: {
      github: '',
      twitter: '',
      blueSky: '',
      discord: '',
      mastodon: '',
      linkedin: '',
      youtube: '',
    },
  },
  features: {
    enableUpgradeCard: false,
    enableUpdateAvatar: false,
    enableAffonsoAffiliate: false,
    enablePromotekitAffiliate: false,
    enableDatafastRevenueTrack: false,
    enableCrispChat: false,
    enableTurnstileCaptcha: false,
  },
  analytics: {
    enableVercelAnalytics: false,
    enableSpeedInsights: false,
  },
  auth: {
    enableGoogleLogin: false,
    enableGithubLogin: false,
    enableCredentialLogin: false,
  },
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: {
        flag: '🇺🇸',
        name: 'English',
      },
    },
  },
  blog: {
    enable: false,
    paginationSize: 6,
    relatedPostsSize: 3,
  },
  docs: {
    enable: false,
  },
  mail: {
    provider: 'resend',
    fromEmail: 'VibeTrans <hello@vibetrans.com>',
    supportEmail: 'VibeTrans <hello@vibetrans.com>',
  },
  newsletter: {
    enable: false,
    provider: 'resend',
    autoSubscribeAfterSignUp: false,
  },
  storage: {
    enable: false,
    provider: 's3',
  },
  payment: {
    provider: 'stripe',
  },
  price: {
    plans: {
      free: {
        id: 'free',
        prices: [],
        isFree: true,
        isLifetime: false,
        credits: {
          enable: false,
          amount: 50,
          expireDays: 30,
        },
      },
    },
  },
  credits: {
    enableCredits: false,
    enablePackagesForFreePlan: false,
    registerGiftCredits: {
      enable: false,
      amount: 50,
      expireDays: 30,
    },
    packages: {},
  },
};
