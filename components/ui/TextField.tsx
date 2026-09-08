export function TextField({
  icon,
  placeholder,
  type = "text",
  name,
  required,
  className = "",
  tone = "muted",
}: {
  icon?: string;
  placeholder: string;
  type?: "text" | "email" | "search";
  name?: string;
  required?: boolean;
  className?: string;
  tone?: "muted" | "white";
}) {
  return (
    <label
      className={`flex h-12 items-center gap-3 overflow-clip rounded-[62px] px-4 py-3 ${tone === "white" ? "bg-white" : "bg-muted"} ${className}`}
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
        className="w-full min-w-0 bg-transparent text-base text-black outline-none placeholder:text-text-40"
      />
    </label>
  );
}
