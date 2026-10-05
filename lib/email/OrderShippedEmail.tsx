import { areaLine, recipientName, streetLine } from "@/lib/address/format";
import { colorLabel } from "@/lib/catalog";
import type { Order, OrderItem } from "@/lib/db/schema";
import { formatPrice } from "@/lib/money";

const text = { fontFamily: "Arial, Helvetica, sans-serif", color: "#000000", margin: 0 };
const muted = { ...text, color: "rgba(0,0,0,0.6)", fontSize: "14px" };
const cell = { padding: "8px 0", verticalAlign: "top" as const };

export function OrderShippedEmail({
  order,
  items,
  orderUrl,
}: {
  order: Order;
  items: OrderItem[];
  orderUrl: string;
}) {
  const address = order.shippingAddress;

  return (
    <html lang="vi">
      <body style={{ backgroundColor: "#ffffff", margin: 0, padding: "24px" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "0 auto" }}>
          <tbody>
            <tr>
              <td>
                <p style={{ ...text, fontSize: "24px", fontWeight: 800 }}>SHOP.CO</p>
                <p style={{ ...text, fontSize: "20px", fontWeight: 700, marginTop: 24 }}>
                  Đơn hàng #{order.number} đang trên đường tới bạn!
                </p>
                <p style={{ ...muted, marginTop: 8 }}>
                  Xin chào {address.firstName}, chúng tôi đã bàn giao đơn hàng cho đơn vị vận chuyển.
                </p>

                {order.carrier || order.trackingNumber ? (
                  <table
                    width="100%"
                    cellPadding={0}
                    cellSpacing={0}
                    style={{ marginTop: 24, backgroundColor: "#F0F0F0", borderRadius: 20 }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ padding: "16px 20px" }}>
                          {order.carrier ? (
                            <p style={muted}>
                              Đơn vị vận chuyển: <strong style={{ color: "#000000" }}>{order.carrier}</strong>
                            </p>
                          ) : null}
                          {order.trackingNumber ? (
                            <p style={{ ...muted, marginTop: order.carrier ? 4 : 0 }}>
                              Mã vận đơn: <strong style={{ color: "#000000" }}>{order.trackingNumber}</strong>
                            </p>
                          ) : null}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : null}

                {order.paymentMethod === "cod" ? (
                  <p style={{ ...text, fontSize: "15px", marginTop: 16 }}>
                    Vui lòng chuẩn bị <strong>{formatPrice(order.total, order.currency)}</strong> để
                    thanh toán khi nhận hàng.
                  </p>
                ) : null}

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
