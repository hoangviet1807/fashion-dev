/** Starter content for the footer pages, seeded by `pnpm seed:pages`. Edit afterwards in Studio. */

export type SeedSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type SeedPage = {
  slug: string;
  title: string;
  description: string;
  sections: SeedSection[];
};

export const PAGES: SeedPage[] = [
  {
    slug: "gioi-thieu",
    title: "Giới thiệu",
    description:
      "SHOP.CO mang đến trang phục hợp phong cách, chất lượng tốt với giá hợp lý cho cả nam và nữ.",
    sections: [
      {
        heading: "Chúng tôi là ai",
        paragraphs: [
          "SHOP.CO là cửa hàng thời trang trực tuyến dành cho những ai muốn mặc đẹp mỗi ngày mà không tốn quá nhiều thời gian. Từ áo thun, sơ mi, hoodie đến quần jeans và quần short, mỗi sản phẩm đều được chọn lọc kỹ về chất liệu, phom dáng và độ bền.",
        ],
      },
      {
        heading: "Điều chúng tôi cam kết",
        bullets: [
          "Sản phẩm chính hãng từ các thương hiệu được tuyển chọn.",
          "Giá niêm yết rõ ràng bằng VND, không phát sinh phí ẩn.",
          "Giao hàng toàn quốc, thanh toán linh hoạt qua VNPay, MoMo hoặc khi nhận hàng.",
          "Đổi trả dễ dàng nếu sản phẩm không vừa hoặc có lỗi.",
        ],
      },
      {
        heading: "Phong cách cho mọi dịp",
        paragraphs: [
          "Dù bạn cần trang phục thường ngày, công sở, dự tiệc hay tập thể thao, SHOP.CO đều có lựa chọn phù hợp. Hãy khám phá cửa hàng và tìm phong cách của riêng bạn.",
        ],
      },
    ],
  },
  {
    slug: "cau-hoi-thuong-gap",
    title: "Câu hỏi thường gặp",
    description: "Giải đáp nhanh về đặt hàng, thanh toán, giao hàng và đổi trả tại SHOP.CO.",
    sections: [
      {
        heading: "Tôi có cần tạo tài khoản để đặt hàng không?",
        paragraphs: [
          "Không bắt buộc. Bạn có thể đặt hàng với tư cách khách. Tuy nhiên khi đăng nhập, bạn có thể theo dõi lịch sử đơn hàng, lưu sổ địa chỉ và giữ giỏ hàng trên nhiều thiết bị.",
        ],
      },
      {
        heading: "SHOP.CO hỗ trợ những hình thức thanh toán nào?",
        paragraphs: [
          "Bạn có thể thanh toán qua VNPay (thẻ ATM, Internet Banking, thẻ quốc tế, VNPAY-QR), ví MoMo, hoặc thanh toán tiền mặt khi nhận hàng (COD).",
        ],
      },
      {
        heading: "Vì sao đơn hàng của tôi bị huỷ khi chưa thanh toán?",
        paragraphs: [
          "Với VNPay và MoMo, sản phẩm được giữ cho bạn trong 15 phút. Nếu thanh toán không hoàn tất trong thời gian này, đơn hàng sẽ hết hạn và bạn có thể đặt lại.",
        ],
      },
      {
        heading: "Làm sao để dùng mã giảm giá?",
        paragraphs: [
          "Nhập mã ở bước giỏ hàng hoặc thanh toán. Mỗi mã có điều kiện riêng như giá trị đơn tối thiểu, mức giảm tối đa và thời hạn sử dụng.",
        ],
      },
      {
        heading: "Tôi theo dõi đơn hàng ở đâu?",
        paragraphs: [
          "Sau khi đặt hàng, bạn sẽ nhận email xác nhận. Nếu đã đăng nhập, bạn có thể xem trạng thái đơn trong mục Tài khoản → Đơn hàng.",
        ],
      },
      {
        heading: "Làm sao để chọn đúng kích cỡ?",
        paragraphs: [
          "Mỗi trang sản phẩm có thông tin phom dáng và kích cỡ. Nếu bạn phân vân giữa hai cỡ, hãy chọn cỡ lớn hơn với các sản phẩm phom ôm.",
        ],
      },
    ],
  },
  {
    slug: "giao-hang",
    title: "Thông tin giao hàng",
    description: "Phí vận chuyển, thời gian giao hàng và những điều cần biết khi nhận hàng.",
    sections: [
      {
        heading: "Phương thức và phí vận chuyển",
        bullets: [
          "Giao hàng tiêu chuẩn: 30.000₫, nhận hàng sau 3–5 ngày làm việc.",
          "Giao hàng nhanh: 50.000₫, nhận hàng sau 1–2 ngày làm việc.",
        ],
        paragraphs: [
          "Thời gian giao hàng tính từ khi đơn được xác nhận (đã thanh toán hoặc đặt COD thành công), không tính thứ Bảy, Chủ nhật và ngày lễ.",
        ],
      },
      {
        heading: "Khu vực giao hàng",
        paragraphs: [
          "SHOP.CO giao hàng đến tất cả 34 tỉnh, thành phố trên toàn quốc. Vui lòng nhập đầy đủ số nhà, tên đường và Phường/Xã để đơn hàng được giao nhanh và chính xác.",
        ],
      },
      {
        heading: "Khi nhận hàng",
        bullets: [
          "Kiểm tra tình trạng gói hàng trước khi ký nhận.",
          "Với đơn COD, vui lòng chuẩn bị đúng số tiền ghi trên đơn hàng.",
          "Nếu gói hàng bị móp, rách hoặc thiếu sản phẩm, hãy từ chối nhận và liên hệ với chúng tôi.",
        ],
      },
    ],
  },
  {
    slug: "doi-tra",
    title: "Đổi trả & hoàn tiền",
    description: "Chính sách đổi size, trả hàng và hoàn tiền của SHOP.CO.",
    sections: [
      {
        heading: "Điều kiện đổi trả",
        bullets: [
          "Trong vòng 7 ngày kể từ khi nhận hàng.",
          "Sản phẩm còn nguyên tem, nhãn, chưa qua sử dụng hoặc giặt.",
          "Có mã đơn hàng hoặc email xác nhận đơn hàng.",
        ],
      },
      {
        heading: "Các trường hợp được hỗ trợ",
        bullets: [
          "Đổi kích cỡ hoặc màu sắc (tuỳ tình trạng tồn kho).",
          "Sản phẩm bị lỗi do nhà sản xuất hoặc giao sai sản phẩm: SHOP.CO chịu toàn bộ phí vận chuyển.",
        ],
      },
      {
        heading: "Hoàn tiền",
        paragraphs: [
          "Sau khi nhận và kiểm tra sản phẩm trả lại, chúng tôi hoàn tiền trong 5–7 ngày làm việc. Đơn thanh toán qua VNPay hoặc MoMo được hoàn về tài khoản/ví đã thanh toán; đơn COD được hoàn qua chuyển khoản ngân hàng.",
        ],
      },
    ],
  },
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật",
    description: "Cách SHOP.CO thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.",
    sections: [
      {
        heading: "Thông tin chúng tôi thu thập",
        bullets: [
          "Họ tên, email, số điện thoại và địa chỉ giao hàng khi bạn đặt hàng hoặc tạo tài khoản.",
          "Lịch sử đơn hàng và giỏ hàng khi bạn đăng nhập.",
        ],
      },
      {
        heading: "Mục đích sử dụng",
        bullets: [
          "Xử lý, giao hàng và hỗ trợ đơn hàng của bạn.",
          "Gửi email xác nhận đơn hàng, cập nhật giao hàng và đặt lại mật khẩu.",
          "Gửi tin khuyến mãi khi bạn đăng ký nhận bản tin (có thể huỷ bất cứ lúc nào).",
        ],
      },
      {
        heading: "Thanh toán",
        paragraphs: [
          "SHOP.CO không lưu thông tin thẻ của bạn. Giao dịch được xử lý trực tiếp trên cổng thanh toán của VNPay hoặc MoMo.",
        ],
      },
      {
        heading: "Bảo vệ thông tin",
        paragraphs: [
          "Mật khẩu được mã hoá một chiều và chúng tôi không chia sẻ thông tin cá nhân của bạn cho bên thứ ba, trừ đơn vị vận chuyển và cổng thanh toán cần thiết để hoàn tất đơn hàng.",
        ],
      },
    ],
  },
  {
    slug: "dieu-khoan",
    title: "Điều khoản & điều kiện",
    description: "Các điều khoản áp dụng khi bạn mua sắm tại SHOP.CO.",
    sections: [
      {
        heading: "Đặt hàng",
        paragraphs: [
          "Đơn hàng chỉ được xác nhận khi thanh toán thành công hoặc khi bạn chọn thanh toán khi nhận hàng. SHOP.CO có quyền huỷ đơn trong trường hợp sản phẩm hết hàng hoặc thông tin đặt hàng không hợp lệ, và sẽ hoàn tiền đầy đủ nếu bạn đã thanh toán.",
        ],
      },
      {
        heading: "Giá và khuyến mãi",
        paragraphs: [
          "Giá sản phẩm được niêm yết bằng VND và có thể thay đổi mà không báo trước. Giá được kiểm tra lại khi bạn đặt hàng; nếu có thay đổi, bạn sẽ được thông báo trước khi xác nhận. Mã giảm giá chỉ áp dụng theo điều kiện của từng chương trình.",
        ],
      },
      {
        heading: "Tài khoản",
        paragraphs: [
          "Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động trên tài khoản của mình. Hãy đặt lại mật khẩu ngay nếu nghi ngờ tài khoản bị truy cập trái phép.",
        ],
      },
      {
        heading: "Đổi trả",
        paragraphs: [
          "Việc đổi trả và hoàn tiền tuân theo Chính sách đổi trả & hoàn tiền của SHOP.CO.",
        ],
      },
    ],
  },
];
