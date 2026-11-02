
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type BookingRequest = {
  carId: number;
  fullName: string;
  email?: string;
  phone: string;
  location: string;
  pickupDate: string;
  returnDate: string;
  message?: string;
};

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

const conflictMessage =
  "This car is already booked for the selected dates. Please choose different dates.";

export async function POST(request: NextRequest) {
  try {
    let body: BookingRequest;

    try {
      body = (await request.json()) as BookingRequest;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data." },
        { status: 400 }
      );
    }

    const {
      carId,
      fullName,
      email,
      phone,
      location,
      pickupDate,
      returnDate,
    } = body;

    if (
      !Number.isInteger(carId) ||
      typeof fullName !== "string" ||
      typeof phone !== "string" ||
      typeof location !== "string" ||
      typeof pickupDate !== "string" ||
      typeof returnDate !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields." },
        { status: 400 }
      );
    }

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanLocation = location.trim();
    const cleanEmail =
      typeof email === "string" ? email.trim() : "";

    if (
      !cleanName ||
      !cleanPhone ||
      !cleanLocation ||
      !pickupDate ||
      !returnDate
    ) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (
      cleanName.length > 100 ||
      cleanPhone.length > 20 ||
      cleanLocation.length > 100 ||
      cleanEmail.length > 254
    ) {
      return NextResponse.json(
        { success: false, message: "One or more fields are too long." },
        { status: 400 }
      );
    }

    if (
      cleanEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    if (
      !isValidDate(pickupDate) ||
      !isValidDate(returnDate)
    ) {
      return NextResponse.json(
        { success: false, message: "Please select valid booking dates." },
        { status: 400 }
      );
    }

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (pickupDate < today) {
      return NextResponse.json(
        { success: false, message: "Pickup date cannot be in the past." },
        { status: 400 }
      );
    }

    if (returnDate <= pickupDate) {
      return NextResponse.json(
        { success: false, message: "Return date must be after pickup date." },
        { status: 400 }
      );
    }

    const pickup = new Date(`${pickupDate}T00:00:00.000Z`);
    const returning = new Date(`${returnDate}T00:00:00.000Z`);

    const totalDays = Math.round(
      (returning.getTime() - pickup.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (totalDays < 1 || totalDays > 365) {
      return NextResponse.json(
        { success: false, message: "Invalid booking duration." },
        { status: 400 }
      );
    }

    // Get car and its current price from the database.
    const carResult = await sql`
      SELECT id, price_per_day, is_available
      FROM cars
      WHERE id = ${carId}
      LIMIT 1
    `;

    const car = carResult[0];

    if (!car) {
      return NextResponse.json(
        { success: false, message: "Car not found." },
        { status: 404 }
      );
    }

    if (!car.is_available) {
      return NextResponse.json(
        { success: false, message: "This car is currently unavailable." },
        { status: 409 }
      );
    }

    const pricePerDay = Number(car.price_per_day);

    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid car pricing." },
        { status: 500 }
      );
    }

    // Check for overlapping pending or confirmed bookings.
    const overlappingBookings = await sql`
      SELECT id
      FROM bookings
      WHERE car_id = ${carId}
        AND status IN ('pending', 'confirmed')
        AND pickup_date < ${returnDate}
        AND return_date > ${pickupDate}
      LIMIT 1
    `;

    if (overlappingBookings.length > 0) {
      return NextResponse.json(
        { success: false, message: conflictMessage },
        { status: 409 }
      );
    }

    const totalPrice = totalDays * pricePerDay;

    // Database exclusion constraint also protects against simultaneous requests.
    const result = await sql`
      INSERT INTO bookings (
        car_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_city,
        pickup_date,
        return_date,
        total_days,
        price_per_day,
        total_price,
        status
      )
      VALUES (
        ${carId},
        ${cleanName},
        ${cleanEmail || null},
        ${cleanPhone},
        ${cleanLocation},
        ${pickupDate},
        ${returnDate},
        ${totalDays},
        ${pricePerDay},
        ${totalPrice},
        'pending'
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Booking request submitted successfully.",
        booking: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking API error:", error);

    const dbError = error as { code?: string };

    if (dbError?.code === "23P01") {
      return NextResponse.json(
        { success: false, message: conflictMessage },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit booking. Please try again.",
      },
      { status: 500 }
    );
  }
}
