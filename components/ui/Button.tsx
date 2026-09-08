import Link from "next/link";

type Variant = "primary" | "secondary" | "onDark";

const variants: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:bg-black/80",
  secondary:
    "border border-line bg-transparent text-black hover:bg-black/[0.04]",
  onDark:
    "bg-white text-black hover:bg-white/90",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  type = "button",
  fullWidth,
  onClick,
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const classes = `inline-flex h-[52px] items-center justify-center overflow-hidden rounded-[62px] px-[54px] py-4 font-medium text-base transition-colors disabled:opacity-50 ${fullWidth ? "w-full" : ""} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
