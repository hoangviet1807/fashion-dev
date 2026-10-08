import type { PerkIcon, ProductPerk } from "@/lib/data/content";

const ICON_PATHS: Record<PerkIcon, string[]> = {
  shipping: [
    "M3 6h11v9H3z",
    "M14 9h4l3 3v3h-7",
    "M7.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
    "M17.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  ],
  returns: ["M4 12a8 8 0 1 0 2.3-5.6", "M4 4v4h4", "M12 8v4l2.5 2.5"],
  hotline: [
    "M5 4h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
  ],
  store: ["M4 9l1.5-5h13L20 9", "M4 9h16v2a3 3 0 0 1-5.3 2 3 3 0 0 1-5.4 0A3 3 0 0 1 4 11V9Z", "M5 13.5V20h14v-6.5", "M10 20v-4h4v4"],
  payment: ["M3 6h18v12H3z", "M3 10h18", "M7 15h3"],
};

function PerkGlyph({ icon }: { icon: PerkIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      {ICON_PATHS[icon].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function ProductPerks({ perks }: { perks: ProductPerk[] }) {
  if (perks.length === 0) return null;
  return (
    <ul className="grid grid-cols-1 gap-4 rounded-[20px] bg-muted p-4 sm:grid-cols-2 xl:p-5">
      {perks.map((perk, index) => (
        <li key={`${perk.icon}-${index}`} className="flex items-center gap-3 text-sm leading-[18px]">
          <PerkGlyph icon={perk.icon} />
          <span>{perk.text}</span>
        </li>
      ))}
    </ul>
  );
}
