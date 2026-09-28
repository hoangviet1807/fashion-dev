import { requireAccountUser } from "@/lib/account/queries";
import { AccountCard } from "@/components/account/AccountFields";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";

export default async function AccountPage() {
  const user = await requireAccountUser("/account");

  return (
    <div className="flex flex-col items-stretch gap-5 xl:flex-row xl:items-start">
      <AccountCard title="Thông tin cá nhân">
        <ProfileForm name={user.name} email={user.email} phone={user.phone} />
      </AccountCard>
      {user.hasPassword ? (
        <AccountCard title="Đổi mật khẩu">
          <ChangePasswordForm />
        </AccountCard>
      ) : null}
    </div>
  );
}
