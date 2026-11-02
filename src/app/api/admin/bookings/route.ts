
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const conflictMessage =
  "This booking conflicts with another pending or confirmed booking for the same car.";

async function isAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return token ? verifyAdminToken(token) : false;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookings = await sql`
      SELECT
        b.*,
        c.name AS car_name,
        c.brand AS car_brand
      FROM bookings b
      LEFT JOIN cars c ON c.id = b.car_id
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Admin bookings GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: { id?: unknown; status?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const id = Number(body?.id);
    const status = body?.status;

    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json(
        { success: false, message: "Valid booking ID is required" },
        { status: 400 }
      );
    }

    if (
      typeof status !== "string" ||
      !["pending", "confirmed", "rejected"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid booking status" },
        { status: 400 }
      );
    }

    // Confirming a booking must not overlap another active booking.
    if (status === "confirmed") {
      const conflicts = await sql`
        SELECT id
        FROM bookings
        WHERE car_id = (
          SELECT car_id
          FROM bookings
          WHERE id = ${id}
          LIMIT 1
        )
        AND id <> ${id}
        AND status IN ('pending', 'confirmed')
        AND pickup_date < (
          SELECT return_date
          FROM bookings
          WHERE id = ${id}
          LIMIT 1
        )
        AND return_date > (
          SELECT pickup_date
          FROM bookings
          WHERE id = ${id}
          LIMIT 1
        )
        LIMIT 1
      `;

      if (conflicts.length > 0) {
        return NextResponse.json(
          { success: false, message: conflictMessage },
          { status: 409 }
        );
      }
    }

    const updated = await sql`
      UPDATE bookings
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, status
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking status updated",
      booking: updated[0],
    });
  } catch (error) {
    console.error("Admin bookings PATCH error:", error);

    const dbError = error as { code?: string };

    if (dbError?.code === "23P01") {
      return NextResponse.json(
        { success: false, message: conflictMessage },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to update booking" },
      { status: 500 }
    );
  }
}
