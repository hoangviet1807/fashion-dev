"use client";

import { ErrorPanel, type ErrorBoundaryProps } from "@/components/feedback/ErrorView";

export default function AdminError(props: ErrorBoundaryProps) {
  return <ErrorPanel {...props} />;
}
