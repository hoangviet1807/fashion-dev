import { areaLine, recipientName, streetLine } from "@/lib/address/format";
import { colorLabel } from "@/lib/catalog";
import type { Order, OrderItem } from "@/lib/db/schema";
import { formatPrice } from "@/lib/money";

const PAYMENT_LABELS: Record<Order["paymentMethod"], string> = {
  vnpay: "Đã thanh toán qua VNPay",
  momo: "Đã thanh toán qua MoMo",
  cod: "Thanh toán khi nhận hàng (COD)",
};

const text = { fontFamily: "Arial, Helvetica, sans-serif", color: "#000000", margin: 0 };
const muted = { ...text, color: "rgba(0,0,0,0.6)", fontSize: "14px" };
const cell = { padding: "8px 0", verticalAlign: "top" as const };

export function OrderConfirmationEmail({
  order,
  items,
  orderUrl,
}: {
  order: Order;
  items: OrderItem[];
  orderUrl: string;
}) {
  const address = order.shippingAddress;
  const price = (amount: number) => formatPrice(amount, order.currency);

  return (
    <html lang="vi">
      <body style={{ backgroundColor: "#ffffff", margin: 0, padding: "24px" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "0 auto" }}>
          <tbody>
            <tr>
              <td>
                <p style={{ ...text, fontSize: "24px", fontWeight: 800 }}>SHOP.CO</p>
                <p style={{ ...text, fontSize: "20px", fontWeight: 700, marginTop: 24 }}>
                  Cảm ơn {address.firstName} đã đặt hàng!
                </p>
                <p style={{ ...muted, marginTop: 8 }}>
                  Đơn hàng #{order.number} · {PAYMENT_LABELS[order.paymentMethod]}
                </p>

                <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: 24, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td style={cell}>
                          <p style={{ ...text, fontSize: "15px", fontWeight: 700 }}>{item.name}</p>
                          <p style={muted}>
                            {item.size} · {colorLabel(item.color)} · ×{item.quantity}
                          </p>
                        </td>
                        <td style={{ ...cell, textAlign: "right" }}>
                          <p style={{ ...text, fontSize: "15px", fontWeight: 700 }}>
                            {price(item.lineTotal)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginTop: 8, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                  <tbody>
                    {[
                      ["Tạm tính", price(order.subtotal)],
                      ["Giảm giá", `-${price(order.discount)}`],
                      ["Phí vận chuyển", price(order.deliveryFee)],
                      ["Tổng cộng", price(order.total)],
                    ].map(([label, value], index, rows) => (
                      <tr key={label}>
                        <td style={cell}>
                          <p style={index === rows.length - 1 ? { ...text, fontWeight: 700 } : muted}>
                            {label}
                          </p>
                        </td>
                        <td style={{ ...cell, textAlign: "right" }}>
                          <p style={{ ...text, fontWeight: 700 }}>{value}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p style={{ ...text, fontSize: "15px", fontWeight: 700, marginTop: 24 }}>Giao tới</p>
                <p style={{ ...muted, marginTop: 4 }}>
                  {recipientName(address)}
                  <br />
                  {streetLine(address)}
                  <br />
                  {areaLine(address)}
                  <br />
                  {order.phone}
                </p>

                <p style={{ marginTop: 32 }}>
                  <a
                    href={orderUrl}
                    style={{
                      ...text,
                      backgroundColor: "#000000",
                      color: "#ffffff",
                      borderRadius: 62,
                      padding: "14px 32px",
                      textDecoration: "none",
                      fontSize: "14px",
                      display: "inline-block",
                    }}
                  >
                    Xem đơn hàng
                  </a>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
