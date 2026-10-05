import Image from "next/image";
import Link from "next/link";
import { requirePermission } from "@/lib/admin/auth";
import { colorLabel } from "@/lib/catalog";
import { listLowStock } from "@/lib/inventory/low-stock";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory/threshold";

export default async function AdminInventoryPage() {
  await requirePermission("inventory:view", "/admin/inventory");
  const products = await listLowStock();
  const variantCount = products.reduce((sum, product) => sum + product.variants.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-base text-text-60">
        {variantCount > 0
          ? `${variantCount} biến thể của ${products.length} sản phẩm còn ${LOW_STOCK_THRESHOLD} sản phẩm trở xuống.`
          : `Không có biến thể nào còn ${LOW_STOCK_THRESHOLD} sản phẩm trở xuống.`}{" "}
        Nhập thêm hàng bằng cách sửa tồn kho (tab Inventory) trong Studio. “Đang giữ” là số lượng của
        các đơn chưa thanh toán xong (giữ tối đa 15 phút).
      </p>

      {products.length > 0 ? (
        <ul className="flex flex-col gap-3 xl:gap-4">
          {products.map((product) => (
            <li key={product.id} className="rounded-[20px] border border-line p-5 xl:px-6">
              <div className="flex items-center gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-[8.66px] bg-product">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-black xl:text-xl">{product.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <a
                      href={`/studio/intent/edit/id=${product.id};type=product`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-black underline"
                    >
                      Sửa tồn kho trong Studio ↗
                    </a>
                    {product.slug ? (
                      <Link href={`/product/${product.slug}`} className="text-text-60 underline hover:text-black">
                        Xem trên site
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>

              <table className="mt-4 w-full table-fixed text-left text-sm xl:text-base">
                <thead className="text-text-60">
                  <tr className="border-b border-line">
                    <th className="py-2 pr-3 font-normal">Biến thể</th>
                    <th className="hidden py-2 pr-3 font-normal md:table-cell md:w-[30%]">SKU</th>
                    <th className="w-[18%] py-2 pr-3 text-right font-normal md:w-[14%]">Tồn kho</th>
                    <th className="w-[18%] py-2 pr-3 text-right font-normal md:w-[14%]">Đang giữ</th>
                    <th className="w-[24%] py-2 text-right font-normal md:w-[16%]">Còn bán được</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => {
                    const available = Math.max(0, variant.stock - variant.reserved);
                    return (
                      <tr key={variant.sku} className="border-b border-line last:border-b-0">
                        <td className="py-2 pr-3 text-black">
                          {variant.size} · {colorLabel(variant.color)}
                        </td>
                        <td className="hidden truncate py-2 pr-3 text-text-60 md:table-cell">{variant.sku}</td>
                        <td className="py-2 pr-3 text-right text-black">{variant.stock}</td>
                        <td className="py-2 pr-3 text-right text-text-60">{variant.reserved}</td>
                        <td className={`py-2 text-right font-bold ${available === 0 ? "text-discount" : "text-black"}`}>
                          {available === 0 ? "Hết hàng" : available}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
