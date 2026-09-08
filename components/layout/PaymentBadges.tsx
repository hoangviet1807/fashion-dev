import { payments } from "@/lib/home-data";

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-end gap-3 ${className}`}>
      {payments.map((badge) => (
        <li key={badge.alt} className="h-[30px] w-[47px] overflow-visible">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={badge.src}
            alt={badge.alt}
            width={47}
            height={30}
            className="h-full w-full object-contain"
          />
        </li>
      ))}
    </ul>
  );
}
