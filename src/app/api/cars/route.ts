
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cars = await sql`
      SELECT
        id,
        name,
        brand,
        category,
        transmission,
        fuel_type,
        seats,
        price_per_day,
        image_url,
        description,
        is_available
      FROM cars
      WHERE is_available = TRUE
      ORDER BY created_at DESC
    `;

    return NextResponse.json(
      { success: true, cars },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cars API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch cars",
      },
      { status: 500 }
    );
  }
}
