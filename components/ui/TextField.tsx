export function TextField({
  icon,
  placeholder,
  type = "text",
  name,
  required,
  className = "",
  tone = "muted",
  defaultValue,
  autoComplete,
  error,
}: {
  icon?: string;
  placeholder: string;
  type?: "text" | "email" | "search" | "tel" | "password";
  name?: string;
  required?: boolean;
  className?: string;
  tone?: "muted" | "white";
  defaultValue?: string;
  autoComplete?: string;
  error?: string;
}) {
  const errorId = error && name ? `${name}-error` : undefined;

  return (
    <label
      className={`flex h-12 cursor-text items-center gap-3 overflow-clip rounded-[62px] px-4 py-3 transition-[background-color,box-shadow] duration-200 ${
        tone === "white"
          ? "bg-white focus-within:shadow-[0_0_0_3px_rgb(255_255_255/0.35)]"
          : "bg-muted not-focus-within:hover:bg-black/[0.07] focus-within:bg-white"
      } ${error ? "ring-1 ring-discount focus-within:ring-2" : tone === "white" ? "" : "focus-within:ring-2 focus-within:ring-black"} ${className}`}
    >
      {icon ? (
        <span className="relative size-6 shrink-0 overflow-clip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt="" width={24} height={24} className="size-full" />
        </span>
      ) : null}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        aria-label={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className="w-full min-w-0 bg-transparent text-base text-black outline-none placeholder:text-text-40"
      />
    </label>
  );
}
