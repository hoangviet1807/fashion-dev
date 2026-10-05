const text = { fontFamily: "Arial, Helvetica, sans-serif", color: "#000000", margin: 0 };
const muted = { ...text, color: "rgba(0,0,0,0.6)", fontSize: "14px" };

export function NewsletterConfirmEmail({
  confirmUrl,
  expiresInHours,
}: {
  confirmUrl: string;
  expiresInHours: number;
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
                  Xác nhận đăng ký nhận bản tin
                </p>
                <p style={{ ...text, fontSize: "15px", marginTop: 12 }}>
                  Bấm nút bên dưới để bắt đầu nhận ưu đãi và sản phẩm mới nhất từ SHOP.CO.
                </p>
                <p style={{ marginTop: 24 }}>
                  <a
                    href={confirmUrl}
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
                    Xác nhận đăng ký
                  </a>
                </p>
                <p style={{ ...muted, marginTop: 24 }}>
                  Liên kết có hiệu lực trong {expiresInHours} giờ. Nếu bạn không đăng ký, hãy bỏ qua
                  email này — bạn sẽ không nhận được email nào khác từ chúng tôi.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
