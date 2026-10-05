import { NextResponse } from "next/server";
import { syncPayosPayment } from "@/lib/orders/payments";
import { isOrderId } from "@/lib/orders/queries";

/** Polled by `/order/[id]/pay` until the bank transfer is confirmed or expires. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isOrderId(id)) return NextResponse.json({ message: "Not found" }, { status: 404 });

  try {
    const result = await syncPayosPayment(id);
    if (!result) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(
      { state: result.state },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(`[payos] Status sync failed for order ${id}`, error);
    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  }
}
