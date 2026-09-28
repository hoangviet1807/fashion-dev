import Link from "next/link";

export function AuthSwitch({ prompt, href, label }: { prompt: string; href: string; label: string }) {
  return (
    <p className="text-center text-sm text-text-60 xl:text-base">
      {prompt}{" "}
      <Link href={href} className="font-medium text-black underline underline-offset-4">
        {label}
      </Link>
    </p>
  );
}

export function withCallback(path: string, callbackUrl: string) {
  return callbackUrl === "/account" ? path : `${path}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}
