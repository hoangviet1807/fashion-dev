import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/** Page views: Vercel Analytics when hosted on Vercel, GA4 when `NEXT_PUBLIC_GA_ID` is set. */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <>
      {process.env.VERCEL ? <VercelAnalytics /> : null}
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}
