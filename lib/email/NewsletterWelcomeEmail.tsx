import { siteUrl } from "@/lib/site-url";

const text = { fontFamily: "Arial, Helvetica, sans-serif", color: "#000000", margin: 0 };
const muted = { ...text, color: "rgba(0,0,0,0.6)", fontSize: "14px" };

export function NewsletterWelcomeEmail({ unsubscribeUrl }: { unsubscribeUrl: string }) {
  return (
    <html lang="vi">
      <body style={{ backgroundColor: "#ffffff", margin: 0, padding: "24px" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 560, margin: "0 auto" }}>
          <tbody>
            <tr>
              <td>
                <p style={{ ...text, fontSize: "24px", fontWeight: 800 }}>SHOP.CO</p>
                <p style={{ ...text, fontSize: "20px", fontWeight: 700, marginTop: 24 }}>
                  Cảm ơn bạn đã đăng ký!
                </p>
                <p style={{ ...text, fontSize: "15px", marginTop: 12 }}>
                  Từ giờ bạn sẽ là người đầu tiên biết về ưu đãi, mã giảm giá và bộ sưu tập mới của
                  SHOP.CO.
                </p>
                <p style={{ marginTop: 24 }}>
                  <a
                    href={`${siteUrl()}/shop`}
                    style={{
                      ...text,
                      display: "inline-block",
                      backgroundColor: "#000000",
                      color: "#ffffff",
                      borderRadius: 62,
                      padding: "14px 32px",
                      fontSize: "15px",
                      textDecoration: "none",
                    }}
                  >
                    Mua sắm ngay
                  </a>
                </p>
                <p style={{ ...muted, marginTop: 32, fontSize: "12px" }}>
                  Không muốn nhận email nữa?{" "}
                  <a href={unsubscribeUrl} style={{ color: "rgba(0,0,0,0.6)" }}>
                    Huỷ đăng ký
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
