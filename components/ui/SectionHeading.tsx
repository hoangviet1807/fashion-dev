export function SectionHeading({
  children,
  align = "center",
  className = "",
}: {
  children: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <h2
      className={`font-display text-[32px] leading-none text-black xl:text-[48px] ${align === "center" ? "text-center" : "text-left"} ${className}`}
    >
      {children}
    </h2>
  );
}
