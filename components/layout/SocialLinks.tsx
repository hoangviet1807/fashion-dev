const socials = [
  {
    href: "https://twitter.com",
    label: "Twitter",
    bg: "/icons/social-bg-white.svg",
    icon: "/icons/twitter.svg",
    iconSize: { width: 11.17, height: 9.03 },
  },
  {
    href: "https://facebook.com",
    label: "Facebook",
    bg: "/icons/social-bg-black.svg",
    icon: "/icons/facebook.svg",
    iconSize: { width: 6.32, height: 12.17 },
  },
  {
    href: "https://instagram.com",
    label: "Instagram",
    bg: "/icons/social-bg-white.svg",
    icon: "/icons/instagram.svg",
    iconSize: { width: 13.55, height: 13.55 },
  },
  {
    href: "https://github.com",
    label: "GitHub",
    bg: "/icons/social-bg-white.svg",
    icon: "/icons/github.svg",
    iconSize: { width: 12.96, height: 12.65 },
  },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {socials.map((social) => (
        <li key={social.label}>
          <a
            href={social.href}
            aria-label={social.label}
            className="relative inline-flex size-7 items-center justify-center overflow-clip"
            target="_blank"
            rel="noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={social.bg}
              alt=""
              width={28}
              height={28}
              className="absolute inset-0 size-full"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={social.icon}
              alt=""
              width={social.iconSize.width}
              height={social.iconSize.height}
              className="relative"
              style={{
                width: social.iconSize.width,
                height: social.iconSize.height,
              }}
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
