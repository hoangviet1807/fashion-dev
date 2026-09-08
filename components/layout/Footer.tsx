import { Logo } from "@/components/ui/Logo";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { PaymentBadges } from "@/components/layout/PaymentBadges";
import { Container } from "@/components/layout/Container";
import { footerColumns } from "@/lib/home-data";

export function Footer() {
  return (
    <footer className="bg-muted pb-8 pt-[180px] xl:pb-[50px] xl:pt-[140px]">
      <Container>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex max-w-[248px] flex-col gap-[25px] xl:gap-[35px]">
            <div className="flex flex-col gap-[25px]">
              <Logo size="footer" />
              <p className="text-sm leading-[22px] text-text-60">
                We have clothes that suits your style and which you’re proud to
                wear. From women to men.
              </p>
            </div>
            <SocialLinks className="hidden xl:flex" />
          </div>
          <SocialLinks className="xl:hidden" />

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 xl:flex xl:flex-1 xl:justify-between xl:pl-8">
            {footerColumns.map((column) => (
              <div key={column.title} className="flex flex-col gap-[26px]">
                <h3 className="text-base font-medium tracking-[3px] uppercase">
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-[13px] text-base leading-[19px] text-text-60">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-4 xl:mt-12 xl:flex xl:items-center xl:justify-between xl:pt-5">
          <p className="text-center text-sm text-text-60 xl:text-left">
            Shop.co © 2000-2023, All Rights Reserved
          </p>
          <PaymentBadges className="mt-4 justify-center xl:mt-0" />
        </div>
      </Container>
    </footer>
  );
}
