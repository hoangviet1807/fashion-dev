"use client";

import { useState, useTransition } from "react";
import { deleteAddress, setDefaultAddress, type AccountResult } from "@/app/(site)/account/actions";
import { areaLine, recipientName, streetLine } from "@/lib/address/format";
import type { Address } from "@/lib/db/schema";
import { FormNotice } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/Button";
import { AccountCard } from "./AccountFields";
import { AddressForm } from "./AddressForm";

const MAX_ADDRESSES = 10;

/** `null` = list only, `"new"` = adding, otherwise the id being edited. */
type Editing = null | "new" | string;

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<AccountResult>) {
    setNotice(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.status === "error") setNotice({ tone: "error", text: result.message });
        else if (result.status === "saved" && result.message) setNotice({ tone: "success", text: result.message });
      } catch {
        setNotice({ tone: "error", text: "Đã có lỗi xảy ra. Vui lòng thử lại." });
      }
    });
  }

  function finishEditing(message?: string) {
    setEditing(null);
    setNotice(message ? { tone: "success", text: message } : null);
  }

  return (
    <div className="flex flex-col gap-3 xl:gap-4">
      {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}

      {addresses.length === 0 && editing !== "new" ? (
        <div className="flex flex-col items-center gap-4 rounded-[20px] border border-line px-5 py-16 text-center">
          <p className="text-base text-text-60">Bạn chưa lưu địa chỉ nào.</p>
        </div>
      ) : null}

      <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-4">
        {addresses.map((address) =>
          editing === address.id ? (
            <li key={address.id} className="xl:col-span-2">
              <AccountCard title="Sửa địa chỉ">
                <AddressForm address={address} onSaved={finishEditing} onCancel={() => finishEditing()} />
              </AccountCard>
            </li>
          ) : (
            <li key={address.id} className="flex flex-col gap-3 rounded-[20px] border border-line p-5 xl:px-6">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-base font-bold text-black xl:text-xl">{recipientName(address)}</p>
                {address.isDefault ? (
                  <span className="shrink-0 rounded-[62px] bg-muted px-3.5 py-1.5 text-sm font-medium text-black">
                    Mặc định
                  </span>
                ) : null}
              </div>
              <p className="text-base text-text-60">
                {address.phone}
                <br />
                {streetLine(address)}
                <br />
                {areaLine(address)}
              </p>
              <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm font-medium xl:text-base">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setNotice(null);
                    setEditing(address.id);
                  }}
                  className="text-black underline underline-offset-4 disabled:opacity-50"
                >
                  Sửa
                </button>
                {!address.isDefault ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setDefaultAddress(address.id))}
                    className="text-black underline underline-offset-4 disabled:opacity-50"
                  >
                    Đặt làm mặc định
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (window.confirm("Xoá địa chỉ này?")) run(() => deleteAddress(address.id));
                  }}
                  className="text-discount underline underline-offset-4 disabled:opacity-50"
                >
                  Xoá
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {editing === "new" ? (
        <AccountCard title="Thêm địa chỉ">
          <AddressForm onSaved={finishEditing} onCancel={() => finishEditing()} />
        </AccountCard>
      ) : addresses.length < MAX_ADDRESSES ? (
        <Button
          variant="secondary"
          className="self-start px-10"
          disabled={pending}
          onClick={() => {
            setNotice(null);
            setEditing("new");
          }}
        >
          Thêm địa chỉ mới
        </Button>
      ) : null}
    </div>
  );
}
