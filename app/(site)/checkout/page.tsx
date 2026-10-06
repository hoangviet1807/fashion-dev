import type { Metadata } from "next";
import { auth } from "@/auth";
import { getAccountUser, getDefaultAddress } from "@/lib/account/queries";
import { CheckoutView, type CheckoutDefaults } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Thanh toán | SHOP.CO",
  description: "Nhập thông tin liên hệ, địa chỉ giao hàng và thanh toán để hoàn tất đơn hàng tại SHOP.CO.",
  robots: { index: false, follow: false },
};

async function accountDefaults(): Promise<CheckoutDefaults> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return {};
  try {
    const [user, address] = await Promise.all([getAccountUser(userId), getDefaultAddress(userId)]);
    return {
      email: user?.email ?? undefined,
      phone: address?.phone ?? user?.phone ?? undefined,
      lastName: address?.lastName,
      firstName: address?.firstName,
      address: address?.address,
      apartment: address?.apartment,
      provinceCode: address?.provinceCode,
      wardCode: address?.wardCode,
    };
  } catch (error) {
    console.error("[checkout] Failed to load account defaults", error);
    return {};
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const { payment } = await searchParams;
  return <CheckoutView paymentFailed={payment === "failed"} defaults={await accountDefaults()} />;
}
