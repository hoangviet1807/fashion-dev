export function SelectField({
  name,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  autoComplete,
  error,
  className = "",
}: {
  name: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  error?: string;
  className?: string;
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label
      className={`relative flex h-12 items-center overflow-clip rounded-[62px] bg-muted px-4 py-3 ${error ? "ring-1 ring-discount" : ""} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-label={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-6 text-base outline-none disabled:cursor-not-allowed ${value ? "text-black" : "text-text-40"}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-black">
            {option.label}
          </option>
        ))}
      </select>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/chevron.svg"
        alt=""
        width={16}
        height={16}
        className="pointer-events-none absolute right-4 size-4"
      />
    </label>
  );
}
