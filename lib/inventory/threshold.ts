const configured = Number.parseInt(process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD ?? "", 10);

/** Variants at or below this many units count as low stock (admin, Studio, alert emails). */
export const LOW_STOCK_THRESHOLD = Number.isNaN(configured) ? 5 : Math.max(0, configured);
