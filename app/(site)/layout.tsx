import { SiteShell } from "@/components/layout/SiteShell";
import { SanityLive } from "@/sanity/lib/live";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <SanityLive />
    </>
  );
}
