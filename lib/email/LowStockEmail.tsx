import { colorLabel } from "@/lib/catalog";
import type { LowStockVariant } from "@/lib/inventory/low-stock";

const text = { fontFamily: "Arial, Helvetica, sans-serif", color: "#000000", margin: 0 };
const muted = { ...text, color: "rgba(0,0,0,0.6)", fontSize: "14px" };
const cell = { padding: "8px 0", verticalAlign: "top" as const };

export function LowStockEmail({
  variants,
  threshold,
  inventoryUrl,
}: {
  variants: LowStockVariant[];
  threshold: number;
  inventoryUrl: string;
}) {
  return (
    <html lang="vi">
      <body style={{ backgroundColor: "#ffffff", margin: 0, padding: "24px" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "0 auto" }}>
          <tbody>
            <tr>
              <td>
                <p style={{ ...text, fontSize: "24px", fontWeight: 800 }}>SHOP.CO</p>
                <p style={{ ...text, fontSize: "20px", fontWeight: 700, marginTop: 24 }}>
                  Sản phẩm sắp hết hàng
                </p>
                <p style={{ ...muted, marginTop: 8 }}>
                  Các biến thể dưới đây vừa còn {threshold} sản phẩm trở xuống sau đơn hàng mới nhất.
                </p>

                <table
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ marginTop: 24, borderTop: "1px solid rgba(0,0,0,0.1)" }}
                >
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.sku}>
                        <td style={cell}>
                          <p style={{ ...text, fontSize: "15px", fontWeight: 700 }}>{variant.name}</p>
                          <p style={muted}>
                            {variant.size} · {colorLabel(variant.color)} · {variant.sku}
                          </p>
                        </td>
                        <td style={{ ...cell, textAlign: "right" }}>
                          <p
                            style={{
                              ...text,
                              fontSize: "15px",
                              fontWeight: 700,
                              color: variant.stock === 0 ? "#FF3333" : "#000000",
                            }}
                          >
                            {variant.stock === 0 ? "Hết hàng" : `Còn ${variant.stock}`}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p style={{ marginTop: 32 }}>
                  <a
                    href={inventoryUrl}
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
                    Xem tồn kho
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
