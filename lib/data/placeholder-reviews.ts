import type { ProductReview } from "@/lib/types/product";

/** Shown on every product until real reviews are stored (roadmap 2.5). */
export const PLACEHOLDER_REVIEWS: ProductReview[] = [
  {
    id: "samantha",
    name: "Thu Trang",
    rating: 4.5,
    quote:
      "Mình rất thích chiếc áo này! Thiết kế độc đáo, vải mặc rất thoải mái. Là dân thiết kế nên mình đánh giá cao sự chỉn chu trong từng chi tiết. Giờ nó là chiếc áo mình mặc nhiều nhất.",
    postedOn: "Đăng ngày 14/08/2023",
  },
  {
    id: "alex",
    name: "Minh Anh",
    rating: 4,
    quote:
      "Áo vượt ngoài mong đợi! Màu sắc tươi, chất lượng in rất tốt. Mình khá khó tính về thẩm mỹ nhưng chiếc áo này thì chắc chắn được điểm cộng.",
    postedOn: "Đăng ngày 15/08/2023",
  },
  {
    id: "ethan",
    name: "Quốc Huy",
    rating: 3.5,
    quote:
      "Một chiếc áo nên có cho ai yêu thích thiết kế đẹp. Họa tiết tối giản mà vẫn phong cách, form áo vừa vặn. Có thể thấy sự tinh tế của nhà thiết kế ở mọi chi tiết.",
    postedOn: "Đăng ngày 16/08/2023",
  },
  {
    id: "olivia",
    name: "Phương Linh",
    rating: 4,
    quote:
      "Mình thích sự đơn giản và tiện dụng. Chiếc áo này không chỉ thể hiện điều đó mà còn mặc rất dễ chịu. Rõ ràng nhà thiết kế đã dồn nhiều sáng tạo để chiếc áo thật nổi bật.",
    postedOn: "Đăng ngày 17/08/2023",
  },
  {
    id: "liam",
    name: "Hoàng Long",
    rating: 4,
    quote:
      "Sự kết hợp giữa thoải mái và sáng tạo. Vải mềm, thiết kế thể hiện rõ tay nghề. Mặc lên như khoác một tác phẩm nghệ thuật phản ánh niềm đam mê thiết kế và thời trang của mình.",
    postedOn: "Đăng ngày 18/08/2023",
  },
  {
    id: "ava",
    name: "Hà My",
    rating: 4.5,
    quote:
      "Không chỉ là một chiếc áo thun mà còn là một tuyên ngôn thiết kế. Các chi tiết tinh xảo và bố cục chỉn chu khiến chiếc áo luôn trở thành chủ đề để trò chuyện.",
    postedOn: "Đăng ngày 19/08/2023",
  },
];
