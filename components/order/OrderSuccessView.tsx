import { PAYMENT_METHODS } from "@/lib/checkout/schema";
import type { Order, OrderItem } from "@/lib/db/schema";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { Button } from "@/components/ui/Button";
import { ClearCart } from "./ClearCart";
import { OrderDetails } from "./OrderDetails";

const CONFIRMED: Order["status"][] = ["paid", "awaiting_fulfillment", "fulfilled"];

export function OrderSuccessView({ order, items }: { order: Order; items: OrderItem[] }) {
  const confirmed = CONFIRMED.includes(order.status);

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

        <OrderDetails
          order={order}
          items={items}
          action={
            <Button
              href="/shop"
              fullWidth
              className="mt-5 h-[54px] text-sm xl:mt-6 xl:h-[60px] xl:text-base"
            >
              Tiếp tục mua sắm
            </Button>
          }
        />
      </Container>
    </div>
  );
}
