"use client";

import { formatPrice } from "@/lib/money";

export function PriceSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  const [low, high] = value;
  const span = max - min || 1;
  const left = ((low - min) / span) * 100;
  const right = ((high - min) / span) * 100;

  return (
    <div>
      <div className="relative h-6">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          aria-label="Giá thấp nhất"
          className="price-range absolute inset-0 z-[1] w-full"
          onChange={(event) => {
            const next = Math.min(Number(event.target.value), high - step);
            onChange([next, high]);
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          aria-label="Giá cao nhất"
          className="price-range absolute inset-0 z-[2] w-full"
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), low + step);
            onChange([low, next]);
          }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm font-medium">
        <span>{formatPrice(low)}</span>
        <span>{formatPrice(high)}</span>
      </div>
    </div>
  );
}
