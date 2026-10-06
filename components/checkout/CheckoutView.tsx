"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, Fragment, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  SHIPPING_METHODS,
  cartSubtotal,
  cartTotal,
  type ShippingMethodId,
} from "@/lib/cart-data";
import { toAnalyticsItem, trackEcommerce } from "@/lib/analytics";
import { useCartHydrated, useCartStore, type CartLine } from "@/lib/cart/store";
import { couponDiscount, toAppliedCoupon } from "@/lib/coupons/discount";
import { colorLabel } from "@/lib/catalog";
import {
  PAYMENT_METHODS,
  VNPAY_METHODS,
  checkoutDetailsSchema,
  fieldErrors,
  type CheckoutField,
  type CheckoutFieldErrors,
  type PaymentMethodId,
  type VnpayMethodId,
} from "@/lib/checkout/schema";
import { PROVINCE_OPTIONS, toOptions, useWards } from "@/lib/address/use-wards";
import { formatPrice } from "@/lib/money";
import { refreshCart, submitCheckout } from "@/app/(site)/checkout/actions";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { OrderSummary } from "@/components/cart/OrderSummary";

const FORM_ID = "checkout-form";

/** Prefilled from the signed-in account and its default address. */
export type CheckoutDefaults = Partial<
  Record<"email" | "phone" | "lastName" | "firstName" | "address" | "apartment" | "provinceCode" | "wardCode", string>
>;

function toLineInput(items: CartLine[]) {
  return items.map(({ sku, quantity }) => ({ sku, quantity }));
}

export function CheckoutView({
  paymentFailed = false,
  defaults = {},
}: {
  paymentFailed?: boolean;
  defaults?: CheckoutDefaults;
}) {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const replace = useCartStore((state) => state.replace);
  const coupon = useCartStore((state) => state.coupon);
  const setCoupon = useCartStore((state) => state.setCoupon);

  const [shipping, setShipping] = useState<ShippingMethodId>("standard");
  const [payment, setPayment] = useState<PaymentMethodId>("vnpay");
  const [vnpayMethod, setVnpayMethod] = useState<VnpayMethodId>("any");
  const [provinceCode, setProvinceCode] = useState(defaults.provinceCode ?? "");
  const [wardCode, setWardCode] = useState(defaults.wardCode ?? "");
  const { wards, loading: wardsLoading } = useWards(provinceCode);
  const wardOptions = useMemo(() => toOptions(wards), [wards]);
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});
  const [notices, setNotices] = useState<string[]>(
    paymentFailed
      ? ["Thanh toán chưa hoàn tất. Giỏ hàng vẫn được giữ — vui lòng thử lại hoặc chọn phương thức thanh toán khác."]
      : [],
  );
  const [leaving, setLeaving] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const refreshed = useRef(false);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const discount = useMemo(() => couponDiscount(coupon, subtotal), [coupon, subtotal]);
  const deliveryFee = SHIPPING_METHODS[shipping].fee;
  const total = cartTotal(subtotal, discount, deliveryFee);

  useEffect(() => {
    if (!hydrated || refreshed.current || items.length === 0) return;
    refreshed.current = true;
    const seenPrices = Object.fromEntries(items.map((item) => [item.sku, item.price]));
    const couponCode = coupon?.code;
    trackEcommerce("begin_checkout", {
      value: subtotal - discount,
      coupon: couponCode,
      items: items.map(toAnalyticsItem),
    });
    refreshCart({ items: toLineInput(items), seenPrices, couponCode })
      .then((quote) => {
        if (!quote) return;
        replace(quote.lines);
        if (couponCode) setCoupon(toAppliedCoupon(quote.coupon));
        if (quote.issues.length > 0) {
          setNotices(quote.issues.map((issue) => issue.message));
        }
      })
      .catch(() => {});
  }, [hydrated, items, coupon, subtotal, discount, replace, setCoupon]);

  useEffect(() => {
    if (notices.length === 0) return;
    noticeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [notices]);

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid]")?.focus();
  }, [errors]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || leaving) return;

    const details = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = checkoutDetailsSchema.safeParse({
      ...details,
      provinceCode,
      wardCode,
      shipping,
      payment,
      vnpayMethod,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setNotices([]);

    startTransition(async () => {
      try {
        const result = await submitCheckout({
          ...parsed.data,
          items: toLineInput(items),
          expectedTotal: total,
          couponCode: coupon?.code ?? null,
        });

        switch (result.status) {
          case "invalid":
            setErrors(result.fieldErrors);
            if (result.message) setNotices([result.message]);
            break;
          case "changed":
            replace(result.quote.lines);
            if (coupon) setCoupon(toAppliedCoupon(result.quote.coupon));
            setNotices([
              result.message,
              ...result.quote.issues.map((issue) => issue.message),
            ]);
            break;
          case "redirect":
            setLeaving(true);
            window.location.assign(result.url);
            break;
          case "placed":
            setLeaving(true);
            router.push(`/order/${result.orderId}/success`);
            break;
          case "pay":
            setLeaving(true);
            router.push(`/order/${result.orderId}/pay`);
            break;
          case "error":
            setNotices([result.message]);
            break;
        }
      } catch {
        setNotices(["Đã có lỗi xảy ra. Vui lòng thử lại."]);
      }
    });
  }

  const noticeList =
    notices.length > 0 ? (
      <div
        ref={noticeRef}
        role="alert"
        className="mt-5 flex flex-col gap-1 rounded-[20px] bg-discount-bg px-5 py-4 text-sm text-discount xl:mt-6 xl:text-base"
      >
        {notices.map((notice) => (
          <p key={notice}>{notice}</p>
        ))}
      </div>
    ) : null;

  return (
    <div>
      <Container className="pb-20 xl:pb-[80px]">
        <hr className="border-line" />
        <div className="pt-5 xl:pt-6">
          <ShopBreadcrumb current="Thanh toán" />
        </div>

        <h1 className="mt-2 font-display text-[32px] leading-none uppercase text-black xl:mt-6 xl:text-[40px]">
          Thanh toán
        </h1>

        {!hydrated ? null : items.length === 0 && !leaving ? (
          <>
            {noticeList}
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-base text-text-60">Giỏ hàng của bạn đang trống.</p>
              <Button href="/shop" className="px-10">
                Mua sắm
              </Button>
            </div>
          </>
        ) : (
          <>
            {noticeList}
            <div className="mt-5 flex flex-col items-stretch gap-5 xl:mt-6 xl:flex-row xl:items-start">
              <form
                id={FORM_ID}
                ref={formRef}
                noValidate
                onSubmit={onSubmit}
                className="flex min-w-0 flex-1 flex-col gap-6 rounded-[20px] border border-line p-5 xl:gap-8 xl:px-6 xl:py-5"
              >
                <Section title="Thông tin liên hệ">
                  <FieldGrid>
                    <Field name="email" type="email" placeholder="Email" autoComplete="email" errors={errors} defaults={defaults} />
                    <Field name="phone" type="tel" placeholder="Số điện thoại" autoComplete="tel" errors={errors} defaults={defaults} />
                  </FieldGrid>
                </Section>

                <hr className="border-line" />

                <Section title="Địa chỉ giao hàng">
                  <FieldGrid>
                    <Field name="lastName" placeholder="Họ" autoComplete="family-name" errors={errors} defaults={defaults} />
                    <Field name="firstName" placeholder="Tên" autoComplete="given-name" errors={errors} defaults={defaults} />
                  </FieldGrid>
                  <Field name="address" placeholder="Số nhà, tên đường" autoComplete="address-line1" errors={errors} defaults={defaults} />
                  <Field name="apartment" placeholder="Toà nhà, căn hộ (không bắt buộc)" autoComplete="address-line2" errors={errors} defaults={defaults} />
                  <FieldGrid>
                    <LocationSelect
                      name="provinceCode"
                      placeholder="Tỉnh / Thành phố"
                      options={PROVINCE_OPTIONS}
                      value={provinceCode}
                      onChange={(code) => {
                        setProvinceCode(code);
                        setWardCode("");
                      }}
                      autoComplete="address-level1"
                      errors={errors}
                    />
                    <LocationSelect
                      name="wardCode"
                      placeholder={wardsLoading ? "Đang tải phường / xã…" : "Phường / Xã"}
                      options={wardOptions}
                      value={wardCode}
                      onChange={setWardCode}
                      disabled={!provinceCode || wardsLoading}
                      autoComplete="address-level2"
                      errors={errors}
                    />
                  </FieldGrid>
                </Section>

                <hr className="border-line" />

                <Section title="Phương thức giao hàng">
                  <div role="radiogroup" aria-label="Phương thức giao hàng" className="flex flex-col gap-3">
                    {(Object.keys(SHIPPING_METHODS) as ShippingMethodId[]).map((id) => (
                      <Choice
                        key={id}
                        name="shipping"
                        value={id}
                        checked={shipping === id}
                        onSelect={() => setShipping(id)}
                        title={SHIPPING_METHODS[id].label}
                        note={SHIPPING_METHODS[id].eta}
                        aside={formatPrice(SHIPPING_METHODS[id].fee)}
                      />
                    ))}
                  </div>
                </Section>

                <hr className="border-line" />

                <Section title="Thanh toán">
                  <div role="radiogroup" aria-label="Phương thức thanh toán" className="flex flex-col gap-3">
                    {(Object.keys(PAYMENT_METHODS) as PaymentMethodId[]).map((id) => (
                      <Fragment key={id}>
                        <Choice
                          name="payment"
                          value={id}
                          checked={payment === id}
                          onSelect={() => setPayment(id)}
                          title={PAYMENT_METHODS[id].label}
                          note={PAYMENT_METHODS[id].note}
                        />
                        {id === "vnpay" && payment === "vnpay" ? (
                          <div
                            role="radiogroup"
                            aria-label="Hình thức thanh toán VNPay"
                            className="flex flex-col gap-3 pl-7 xl:pl-8"
                          >
                            {(Object.keys(VNPAY_METHODS) as VnpayMethodId[]).map((method) => (
                              <Choice
                                key={method}
                                name="vnpayMethod"
                                value={method}
                                checked={vnpayMethod === method}
                                onSelect={() => setVnpayMethod(method)}
                                title={VNPAY_METHODS[method].label}
                                note={VNPAY_METHODS[method].note}
                              />
                            ))}
                          </div>
                        ) : null}
                      </Fragment>
                    ))}
                  </div>
                </Section>
              </form>

              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                total={total}
                deliveryFee={deliveryFee}
                action={
                  <Button
                    type="submit"
                    form={FORM_ID}
                    fullWidth
                    disabled={pending || leaving}
                    className="mt-4 h-[54px] gap-3 text-sm xl:mt-6 xl:h-[60px] xl:text-base"
                  >
                    {pending || leaving ? "Đang đặt hàng…" : "Đặt hàng"}
                    <Icon
                      src="/icons/arrow-right.svg"
                      size={20}
                      className="-rotate-90 brightness-0 invert"
                    />
                  </Button>
                }
              >
                <ul className="mt-4 flex flex-col gap-4 xl:mt-6">
                  {items.map((item) => (
                    <li key={item.sku} className="flex items-center gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-[8.66px] bg-product">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-black">{item.name}</p>
                        <p className="text-sm text-text-60">
                          {item.size} · {colorLabel(item.color)} · ×{item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 text-base font-bold text-black">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <hr className="mt-4 border-line xl:mt-6" />
              </OrderSummary>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-4 text-xl font-bold text-black xl:text-2xl">{title}</legend>
      {children}
    </fieldset>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
}

function Field({
  name,
  placeholder,
  type = "text",
  autoComplete,
  errors,
  defaults,
}: {
  name: CheckoutField & keyof CheckoutDefaults;
  placeholder: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  errors: CheckoutFieldErrors;
  defaults: CheckoutDefaults;
}) {
  const error = errors[name];
  return (
    <div className="min-w-0">
      <TextField
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaults[name]}
        error={error}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 px-4 text-sm text-discount">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function LocationSelect({
  name,
  errors,
  ...props
}: Omit<React.ComponentProps<typeof SelectField>, "name" | "error"> & {
  name: CheckoutField;
  errors: CheckoutFieldErrors;
}) {
  const error = errors[name];
  return (
    <div className="min-w-0">
      <SelectField name={name} error={error} {...props} />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 px-4 text-sm text-discount">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Choice({
  name,
  value,
  checked,
  onSelect,
  title,
  note,
  aside,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  note: string;
  aside?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-[20px] border px-4 py-3 xl:px-5 xl:py-4 ${
        checked ? "border-black" : "border-line"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="size-4 shrink-0 accent-black"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium text-black">{title}</span>
        <span className="block text-sm text-text-60">{note}</span>
      </span>
      {aside ? <span className="shrink-0 text-base font-bold text-black">{aside}</span> : null}
    </label>
  );
}
