const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

/** Shared by the browser, Node and edge SDKs; everything is a no-op without a DSN. */
export const sentryOptions = {
  dsn,
  enabled: Boolean(dsn),
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
    process.env.NEXT_PUBLIC_VERCEL_ENV ??
    process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  // Orders carry names, phones and addresses; keep IPs, cookies and bodies out of events.
  sendDefaultPii: false,
};
