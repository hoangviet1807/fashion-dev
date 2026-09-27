import { Be_Vietnam_Pro, Montserrat } from "next/font/google";

/** Both faces must cover Vietnamese (ơ, ư, ạ, ế, ₫ …); Satoshi / Integral CF did not. */
export const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const displayFont = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: "700",
  variable: "--font-heading",
  display: "swap",
});
