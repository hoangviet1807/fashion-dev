import { signInWithOAuth } from "@/app/(site)/(auth)/actions";
import type { OAuthProviderId } from "@/auth";
import { OrDivider } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/Button";

export function OAuthButtons({
  providers,
  callbackUrl,
}: {
  providers: { id: OAuthProviderId; label: string }[];
  callbackUrl: string;
}) {
  if (providers.length === 0) return null;

  return (
    <>
      <OrDivider />
      <div className="flex flex-col gap-3">
        {providers.map(({ id, label }) => (
          <form key={id} action={signInWithOAuth}>
            <input type="hidden" name="provider" value={id} />
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="secondary" fullWidth className="px-6">
              Tiếp tục với {label}
            </Button>
          </form>
        ))}
      </div>
    </>
  );
}
