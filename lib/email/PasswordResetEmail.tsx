const text = { fontFamily: "Arial, Helvetica, sans-serif", color: "#000000", margin: 0 };
const muted = { ...text, color: "rgba(0,0,0,0.6)", fontSize: "14px" };

export function PasswordResetEmail({
  name,
  resetUrl,
  expiresInMinutes,
}: {
  name: string | null;
  resetUrl: string;
  expiresInMinutes: number;
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
                  {name ? `Xin chào ${name},` : "Xin chào,"}
                </p>
                <p style={{ ...text, fontSize: "15px", marginTop: 12 }}>
                  Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SHOP.CO của bạn.
                </p>
                <p style={{ marginTop: 24 }}>
                  <a
                    href={resetUrl}
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
                    Đặt lại mật khẩu
                  </a>
                </p>
                <p style={{ ...muted, marginTop: 24 }}>
                  Liên kết có hiệu lực trong {expiresInMinutes} phút và chỉ dùng được một lần. Nếu bạn
                  không yêu cầu, hãy bỏ qua email này — mật khẩu của bạn sẽ không thay đổi.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
