
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
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
        { success: false, message: "Invalid registration data." },
        { status: 400 }
      );
    }

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";

    const city =
      typeof body.city === "string" ? body.city.trim() : "";

    if (!fullName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (fullName.length > 100 || email.length > 254) {
      return NextResponse.json(
        { success: false, message: "Name or email is too long." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email." },
        { status: 400 }
      );
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters and at most 72 bytes.",
        },
        { status: 400 }
      );
    }

    if (phone.length > 20 || city.length > 100) {
      return NextResponse.json(
        { success: false, message: "Phone or city is too long." },
        { status: 400 }
      );
    }

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);

    const result = await sql`
      INSERT INTO customers (
        full_name,
        email,
        phone,
        city,
        password_hash
      )
      VALUES (
        ${fullName},
        ${email},
        ${phone || null},
        ${city || null},
        ${passwordHash}
      )
      RETURNING id, full_name, email, phone, city
    `;

    const customer = result[0];

    const token = createCustomerToken(Number(customer.id));

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        customer,
      },
      { status: 201 }
    );

    response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    const dbError = error as { code?: string };

    if (dbError?.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    console.error("Customer registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create account. Please try again.",
      },
      { status: 500 }
    );
  }
}
