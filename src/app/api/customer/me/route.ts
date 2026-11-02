import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  CUSTOMER_COOKIE_NAME,
  verifyCustomerToken,
} from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(
      CUSTOMER_COOKIE_NAME
    )?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not logged in" },
        { status: 401 }
      );
    }

    const session = verifyCustomerToken(token);

    if (!session) {
      const response = NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 }
      );

      response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    const customers = await sql`
      SELECT id, full_name, email, phone, city
      FROM customers
      WHERE id = ${session.customerId}
      LIMIT 1
    `;

    if (customers.length === 0) {
      const response = NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 401 }
      );

      response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json({
      success: true,
      customer: customers[0],
    });
  } catch (error) {
    console.error("Customer session error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}