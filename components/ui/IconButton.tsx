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
      className={`relative isolate inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 before:absolute before:-inset-2 before:-z-10 before:rounded-full before:bg-black/0 before:transition-colors before:duration-200 before:content-[''] hover:before:bg-black/[0.06] active:scale-90 motion-reduce:active:scale-100 ${className}`}
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
