import Link from "next/link";

type Variant = "primary" | "secondary" | "onDark";

const variants: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:-translate-y-px hover:bg-neutral-800 hover:shadow-[0_10px_24px_-12px_rgb(0_0_0/0.55)] focus-visible:outline-black",
  secondary:
    "border border-line bg-transparent text-black before:bg-black hover:border-black hover:text-white hover:before:scale-y-100 focus-visible:outline-black",
  onDark:
    "bg-white text-black hover:-translate-y-px hover:bg-neutral-100 hover:shadow-[0_10px_24px_-12px_rgb(255_255_255/0.35)] focus-visible:outline-white",
};

export function buttonClasses({
  variant = "primary",
  fullWidth,
  className = "",
}: {
  variant?: Variant;
  fullWidth?: boolean;
  className?: string;
}) {
  return `group/btn relative isolate inline-flex h-[52px] cursor-pointer select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[62px] px-[54px] py-4 font-medium text-base transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out-expo before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-[inherit] before:transition-transform before:duration-300 before:ease-out-expo before:content-[''] active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-busy:pointer-events-none motion-reduce:transition-none motion-reduce:before:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 ${fullWidth ? "w-full" : ""} ${variants[variant]} ${className}`;
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
    />
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  type = "button",
  fullWidth,
  onClick,
  disabled,
  loading,
  form,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  form?: string;
}) {
  const classes = buttonClasses({ variant, fullWidth, className });

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      form={form}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
