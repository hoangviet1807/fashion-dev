export default function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="motion-safe:animate-page-in">{children}</div>;
}
