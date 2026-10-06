"use client";

import { ErrorPanel, type ErrorBoundaryProps } from "@/components/feedback/ErrorView";

export default function AccountError(props: ErrorBoundaryProps) {
  return <ErrorPanel {...props} />;
}
