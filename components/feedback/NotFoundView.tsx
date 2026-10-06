import { Button } from "@/components/ui/Button";
import { StatusView } from "./StatusView";

export function NotFoundView() {
  return (
    <StatusView
      crumb="Không tìm thấy"
      title="Không tìm thấy trang"
      message="Trang bạn tìm không tồn tại hoặc đã được chuyển đi. Hãy kiểm tra lại đường dẫn hoặc tiếp tục mua sắm."
    >
      <Button href="/shop" className="px-10">
        Mua sắm
      </Button>
      <Button href="/" variant="secondary" className="px-10">
        Về trang chủ
      </Button>
    </StatusView>
  );
}
