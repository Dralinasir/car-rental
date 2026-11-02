
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { sql } from "@/lib/db";
import {
  CUSTOMER_COOKIE_NAME,
  createCustomerToken,
} from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid login data." },
        { status: 400 }
      );
    }

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT
        id,
        full_name,
        email,
        phone,
        city,
        password_hash
      FROM customers
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;

    const customer = result[0];

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordMatches = await compare(
      password,
      customer.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createCustomerToken(Number(customer.id));

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
      },
    });

    response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Customer login error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to login. Please try again." },
      { status: 500 }
    );
  }
}
