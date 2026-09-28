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
      className={`flex h-12 items-center gap-3 overflow-clip rounded-[62px] px-4 py-3 ${tone === "white" ? "bg-white" : "bg-muted"} ${error ? "ring-1 ring-discount" : ""} ${className}`}
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
