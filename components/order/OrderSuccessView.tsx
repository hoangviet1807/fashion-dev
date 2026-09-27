import Image from "next/image";
import { SHIPPING_METHODS, type ShippingMethodId } from "@/lib/cart-data";
import { areaLine, recipientName, streetLine } from "@/lib/address/format";
import { colorLabel } from "@/lib/catalog";
import { PAYMENT_METHODS } from "@/lib/checkout/schema";
import type { Order, OrderItem } from "@/lib/db/schema";
import { formatPrice } from "@/lib/money";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { Button } from "@/components/ui/Button";
import { ClearCart } from "./ClearCart";

const CONFIRMED: Order["status"][] = ["paid", "awaiting_fulfillment", "fulfilled"];

export function OrderSuccessView({ order, items }: { order: Order; items: OrderItem[] }) {
  const confirmed = CONFIRMED.includes(order.status);
  const address = order.shippingAddress;
  const shipping = SHIPPING_METHODS[order.shippingMethod as ShippingMethodId];
  const price = (amount: number) => formatPrice(amount, order.currency);

  return (
    <div>
      {confirmed ? <ClearCart /> : null}
      <Container className="pb-20 xl:pb-[80px]">
        <hr className="border-line" />
        <div className="pt-5 xl:pt-6">
          <ShopBreadcrumb current={`Đơn hàng #${order.number}`} />
        </div>

        <h1 className="mt-2 font-display text-[32px] leading-none uppercase text-black xl:mt-6 xl:text-[40px]">
          {confirmed ? "Cảm ơn bạn đã đặt hàng" : "Đang chờ thanh toán"}
        </h1>
        <p className="mt-3 text-base text-text-60 xl:mt-4">
          {confirmed
            ? `Đơn hàng #${order.number} đã được xác nhận. Chúng tôi đã gửi email xác nhận tới ${order.email}.`
            : `Chúng tôi chưa nhận được thanh toán cho đơn hàng #${order.number}. Vui lòng tải lại trang sau giây lát để xem kết quả từ ${PAYMENT_METHODS[order.paymentMethod].label}.`}
        </p>

        <div className="mt-5 flex flex-col items-stretch gap-5 xl:mt-6 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-6 rounded-[20px] border border-line p-5 xl:px-6 xl:py-5">
            <Detail title="Địa chỉ giao hàng">
              {recipientName(address)}
              <br />
              {streetLine(address)}
              <br />
              {areaLine(address)}
            </Detail>
            <hr className="border-line" />
            <Detail title="Liên hệ">
              {order.email}
              <br />
              {order.phone}
            </Detail>
            <hr className="border-line" />
            <Detail title="Phương thức giao hàng">
              {shipping ? `${shipping.label} · ${shipping.eta}` : order.shippingMethod}
            </Detail>
            <hr className="border-line" />
            <Detail title="Thanh toán">{PAYMENT_METHODS[order.paymentMethod].label}</Detail>
          </div>

          <aside className="w-full rounded-[20px] border border-line p-5 xl:max-w-[505px] xl:px-6 xl:py-5">
            <h2 className="text-xl font-bold text-black xl:text-2xl">Tóm tắt đơn hàng</h2>

            <ul className="mt-4 flex flex-col gap-4 xl:mt-6">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-[8.66px] bg-product">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-black">{item.name}</p>
                    <p className="text-sm text-text-60">
                      {item.size} · {colorLabel(item.color)} · ×{item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 text-base font-bold text-black">
                    {price(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <hr className="mt-4 border-line xl:mt-6" />

            <div className="mt-4 flex flex-col gap-5 xl:mt-6">
              <Row label="Tạm tính" value={price(order.subtotal)} />
              <Row label="Giảm giá" value={`-${price(order.discount)}`} discount />
              <Row label="Phí vận chuyển" value={price(order.deliveryFee)} />
              <hr className="border-line" />
              <div className="flex items-center justify-between">
                <span className="text-base text-black xl:text-xl">Tổng cộng</span>
                <span className="text-xl font-bold text-black xl:text-2xl">
                  {price(order.total)}
                </span>
              </div>
            </div>

            <Button
              href="/shop"
              fullWidth
              className="mt-5 h-[54px] text-sm xl:mt-6 xl:h-[60px] xl:text-base"
            >
              Tiếp tục mua sắm
            </Button>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-black xl:text-2xl">{title}</h2>
      <p className="mt-3 text-base text-text-60">{children}</p>
    </div>
  );
}

function Row({ label, value, discount }: { label: string; value: string; discount?: boolean }) {
  return (
    <div className="flex items-center justify-between text-base xl:text-xl">
      <span className="text-text-60">{label}</span>
      <span className={`font-bold ${discount ? "text-discount" : "text-black"}`}>{value}</span>
    </div>
  );
}
