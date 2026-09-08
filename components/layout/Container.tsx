export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-10 xl:px-[100px] ${className}`}
    >
      {children}
    </div>
  );
}
