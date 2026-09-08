export function IconButton({
  src,
  label,
  size = 24,
  className = "",
  onClick,
  type = "button",
}: {
  src: string;
  label: string;
  size?: number;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex size-6 shrink-0 items-center justify-center overflow-clip ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="size-full object-contain"
      />
    </button>
  );
}
