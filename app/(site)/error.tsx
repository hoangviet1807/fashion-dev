"use client";

import { ErrorView, type ErrorBoundaryProps } from "@/components/feedback/ErrorView";

export default function SiteError(props: ErrorBoundaryProps) {
  return <ErrorView {...props} />;
}
