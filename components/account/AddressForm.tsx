"use client";

import { useMemo, useState } from "react";
import { saveAddress } from "@/app/(site)/account/actions";
import { addressSchema } from "@/lib/account/schema";
import { PROVINCE_OPTIONS, toOptions, useWards } from "@/lib/address/use-wards";
import type { Address } from "@/lib/db/schema";
import { FormNotice } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/Button";
import { AccountField, AccountSelect, FieldGrid } from "./AccountFields";
import { useAccountForm } from "./useAccountForm";

export function AddressForm({
  address,
  onSaved,
  onCancel,
}: {
  /** Omitted when adding a new address. */
  address?: Address;
  onSaved: (message?: string) => void;
  onCancel: () => void;
}) {
  const [provinceCode, setProvinceCode] = useState(address?.provinceCode ?? "");
  const [wardCode, setWardCode] = useState(address?.wardCode ?? "");
  const { wards, loading: wardsLoading } = useWards(provinceCode);
  const wardOptions = useMemo(() => toOptions(wards), [wards]);

  const { errors, notice, pending, onSubmit, formRef } = useAccountForm({
    schema: addressSchema,
    action: saveAddress,
    extra: { provinceCode, wardCode, id: address?.id },
    onSaved: (_form, message) => onSaved(message),
  });

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}
      <FieldGrid>
        <AccountField name="lastName" placeholder="Họ" autoComplete="family-name" defaultValue={address?.lastName} errors={errors} />
        <AccountField name="firstName" placeholder="Tên" autoComplete="given-name" defaultValue={address?.firstName} errors={errors} />
      </FieldGrid>
      <AccountField name="phone" type="tel" placeholder="Số điện thoại" autoComplete="tel" defaultValue={address?.phone} errors={errors} />
      <AccountField name="address" placeholder="Số nhà, tên đường" autoComplete="address-line1" defaultValue={address?.address} errors={errors} />
      <AccountField
        name="apartment"
        placeholder="Toà nhà, căn hộ (không bắt buộc)"
        autoComplete="address-line2"
        defaultValue={address?.apartment}
        errors={errors}
      />
      <FieldGrid>
        <AccountSelect
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
        <AccountSelect
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
      <label className="flex cursor-pointer items-center gap-3 px-1 py-1 text-base text-black">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault}
          disabled={address?.isDefault}
          className="size-4 shrink-0 accent-black"
        />
        Đặt làm địa chỉ mặc định
      </label>
      <div className="mt-2 flex flex-col gap-3 md:flex-row">
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Đang lưu…" : "Lưu địa chỉ"}
        </Button>
        <Button type="button" variant="secondary" fullWidth disabled={pending} onClick={onCancel}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
