import { StatusView } from "@/components/feedback/StatusView";
import { Button } from "@/components/ui/Button";

export default function ProductNotFound() {
  return (
    <StatusView
      crumb="Sản phẩm"
      title="Không tìm thấy sản phẩm"
      message="Sản phẩm này không tồn tại hoặc đã ngừng bán. Bạn có thể xem các sản phẩm khác trong cửa hàng."
    >
      <Button href="/shop" className="px-10">
        Xem cửa hàng
      </Button>
      <Button href="/shop?sort=newest" variant="secondary" className="px-10">
        Hàng mới về
      </Button>
    </StatusView>
  );
}
