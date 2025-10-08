import { AhrefsAnalytics } from './ahrefs-analytics';
import ClarityAnalytics from './clarity-analytics';
import DataFastAnalytics from './data-fast-analytics';
import GoogleAnalytics from './google-analytics';
import { PlausibleAnalytics } from './plausible-analytics';
import { SelineAnalytics } from './seline-analytics';
import { UmamiAnalytics } from './umami-analytics';

/**
 * Analytics Components all in one
 *
 * 1. all the analytics components only work in production
 * 2. only work if the environment variable for the analytics is set
 */
export function Analytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      {/* google analytics */}
      <GoogleAnalytics />

      {/* umami analytics */}
      <UmamiAnalytics />

      {/* plausible analytics */}
      <PlausibleAnalytics />

      {/* ahrefs analytics */}
      <AhrefsAnalytics />

      {/* datafast analytics */}
      <DataFastAnalytics />

      {/* seline analytics */}
      <SelineAnalytics />

      {/* clarity analytics */}
      <ClarityAnalytics />
    </>
  );
}
