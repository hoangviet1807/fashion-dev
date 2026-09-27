import type { ShippingAddress } from "@/lib/db/schema";

/** Vietnamese order: family name first. */
export function recipientName(address: ShippingAddress) {
  return [address.lastName, address.firstName].filter(Boolean).join(" ");
}

export function streetLine(address: ShippingAddress) {
  return [address.address, address.apartment].filter(Boolean).join(", ");
}

export function areaLine(address: ShippingAddress) {
  if (address.province) {
    return [address.ward, address.province].filter(Boolean).join(", ");
  }
  return [address.city, address.region, address.postalCode, address.country]
    .filter(Boolean)
    .join(", ");
}
