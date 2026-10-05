import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookPayload = { _type?: string; slug?: string };

/**
 * Sanity GROQ-powered webhook target (production fallback to <SanityLive />).
 * Webhook filter: `_type in ["product", "category", "dressStyle", "brand", "testimonial", "page", "siteSettings"]`
 * Projection: `{ _type, "slug": slug.current }`
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new Response("SANITY_REVALIDATE_SECRET is not set", { status: 500 });
  }

  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      request,
      secret,
      true,
    );
    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }
    if (!body?._type) {
      return new Response("Missing _type", { status: 400 });
    }

    const tags = [body._type];
    if (body.slug) tags.push(`${body._type}:${body.slug}`);
    for (const tag of tags) revalidateTag(tag, { expire: 0 });

    return NextResponse.json({ revalidated: tags });
  } catch (error) {
    return new Response((error as Error).message, { status: 500 });
  }
}
