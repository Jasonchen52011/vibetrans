const DEFAULT_OPERATING_SYSTEMS = [
  'Windows',
  'macOS',
  'Chrome',
  'Microsoft Edge',
  'Safari',
  'Android',
  'iOS',
];

const DEFAULT_AGGREGATE_RATING = {
  '@type': 'AggregateRating' as const,
  ratingValue: 4.8,
  ratingCount: 4526,
  bestRating: 5,
  worstRating: 1,
};

interface BuildToolStructuredDataOptions {
  name: string;
  description: string;
  featureList?: string[];
  operatingSystems?: string[];
  aggregateRating?: {
    '@type'?: 'AggregateRating';
    ratingValue?: number;
    ratingCount?: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export function buildToolStructuredData({
  name,
  description,
  featureList,
  operatingSystems,
  aggregateRating,
}: BuildToolStructuredDataOptions) {
  const osList =
    operatingSystems && operatingSystems.length > 0
      ? operatingSystems
      : DEFAULT_OPERATING_SYSTEMS;

  const rating = {
    ...DEFAULT_AGGREGATE_RATING,
    ...(aggregateRating || {}),
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    applicationCategory: 'WebApplication',
    description,
    operatingSystem: osList,
    aggregateRating: rating,
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'USD',
    },
    ...(featureList && featureList.length > 0 ? { featureList } : {}),
  };
}
