
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const cars = [
  {
    id: 1,
    name: "Mercedes-Benz C-Class",
    category: "Luxury Sedan",
    price: 18000,
    seats: 5,
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 2,
    name: "BMW 5 Series",
    category: "Executive Sedan",
    price: 22000,
    seats: 5,
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 3,
    name: "Toyota Land Cruiser",
    category: "Premium SUV",
    price: 35000,
    seats: 7,
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 4,
    name: "Porsche 911",
    category: "Sports Car",
    price: 45000,
    seats: 2,
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 5,
    name: "Range Rover Sport",
    category: "Premium SUV",
    price: 38000,
    seats: 5,
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: 6,
    name: "Toyota Corolla",
    category: "Economy Sedan",
    price: 5000,
    seats: 5,
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1000&q=85",
  },
];

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPKR(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export default function BookingPage() {
  const params = useParams<{ carId: string }>();
  const carId = Number(params.carId);

  const car = cars.find((item) => item.id === carId);

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rentalDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 0;

    const start = new Date(`${pickupDate}T00:00:00`);
    const end = new Date(`${returnDate}T00:00:00`);

    const difference = end.getTime() - start.getTime();

    if (difference <= 0) return 0;

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }, [pickupDate, returnDate]);

  const totalPrice = rentalDays * (car?.price ?? 0);

  if (!car) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <CarFront className="mx-auto" size={48} />

          <h1 className="mt-5 text-3xl font-black">
            Car Not Found
          </h1>

          <p className="mt-3 text-neutral-500">
            Please select a vehicle from our available cars.
          </p>

          <Link
            href="/cars"
            className="mt-6 inline-block bg-black px-6 py-3 font-semibold text-white"
          >
            Browse Cars
          </Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setBookingId(null);

    if (pickupDate < getToday()) {
      setError("Pickup date cannot be in the past.");
      return;
    }

    if (returnDate <= pickupDate) {
      setError("Return date must be after the pickup date.");
      return;
    }

    if (rentalDays <= 0) {
      setError("Please select valid pickup and return dates.");
      return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!fullName.trim() || !location.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId: car!.id,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          location: location.trim(),
          pickupDate,
          returnDate,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Unable to submit booking. Please try again."
        );
        return;
      }

      setBookingId(Number(data.booking.id));
      setSuccess(
        data.message || "Your booking request has been submitted successfully."
      );

      // Clear form after successful database submission
      setPickupDate("");
      setReturnDate("");
      setFullName("");
      setPhone("");
      setEmail("");
      setLocation("");
      setMessage("");
    } catch (err) {
      console.error("Booking submission error:", err);

      setError(
        "Unable to connect to the server. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-[0.2em]"
          >
            DRIVORA<span className="text-neutral-400">.</span>
          </Link>

          <Link
            href="/cars"
            className="text-sm font-semibold hover:text-neutral-500"
          >
            <ArrowLeft className="mr-2 inline" size={17} />
            Back to Cars
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            Reserve Your Vehicle
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-5xl">
            Book Your Ride.
          </h1>

          <p className="mt-4 text-neutral-500">
            Select your dates, review the price and submit your booking request.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="border border-neutral-200 bg-white p-6 md:p-8">
            <h2 className="text-2xl font-black">Your Details</h2>

            <p className="mt-2 text-sm text-neutral-500">
              Complete the form to submit your booking request.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  required
                  maxLength={100}
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    required
                    type="tel"
                    maxLength={20}
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email (Optional)
                  </label>

                  <input
                    id="email"
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="pickupDate"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Pickup Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                      size={18}
                    />

                    <input
                      id="pickupDate"
                      required
                      type="date"
                      min={getToday()}
                      value={pickupDate}
                      onChange={(event) => {
                        setPickupDate(event.target.value);

                        if (
                          returnDate &&
                          event.target.value >= returnDate
                        ) {
                          setReturnDate("");
                        }
                      }}
                      className="w-full border border-neutral-300 py-3 pl-10 pr-3 outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="returnDate"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Return Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                      size={18}
                    />

                    <input
                      id="returnDate"
                      required
                      type="date"
                      min={pickupDate || getToday()}
                      value={returnDate}
                      onChange={(event) => setReturnDate(event.target.value)}
                      className="w-full border border-neutral-300 py-3 pl-10 pr-3 outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold"
                >
                  Pickup Location / City
                </label>

                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={18}
                  />

                  <input
                    id="location"
                    required
                    maxLength={200}
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Enter your preferred pickup city"
                    className="w-full border border-neutral-300 py-3 pl-10 pr-4 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold"
                >
                  Additional Message (Optional)
                </label>

                <textarea
                  id="message"
                  rows={3}
                  maxLength={1000}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Any special requests?"
                  className="w-full resize-y border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {success && (
                <div
                  role="status"
                  className="border border-green-200 bg-green-50 p-5 text-green-800"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 size={21} />
                    Booking Request Submitted!
                  </div>

                  <p className="mt-2 text-sm">{success}</p>

                  {bookingId !== null && (
                    <p className="mt-2 text-sm font-bold">
                      Booking ID: #{bookingId}
                    </p>
                  )}

                  <p className="mt-2 text-xs">
                    Your request is pending. This does not mean the rental is
                    confirmed yet.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black px-6 py-4 font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
              >
                {isSubmitting
                  ? "Submitting Booking..."
                  : "Submit Booking Request"}
              </button>

              <p className="text-xs leading-5 text-neutral-500">
                Your booking request will be saved in our database. The
                reservation remains pending until it is confirmed.
              </p>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="overflow-hidden border border-neutral-200 bg-white">
              <img
                src={car.image}
                alt={car.name}
                className="h-64 w-full object-cover"
              />

              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {car.category}
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {car.name}
                </h2>

                <p className="mt-3 text-neutral-500">
                  {car.seats} Seats
                </p>

                <div className="mt-6 border-t border-neutral-200 pt-6">
                  <p className="text-sm text-neutral-500">
                    Daily rental rate
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    {formatPKR(car.price)}
                    <span className="text-sm font-normal text-neutral-500">
                      {" "}/ day
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-neutral-200 bg-white p-6">
              <h3 className="text-xl font-black">Price Summary</h3>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Daily rate</span>
                  <span className="font-semibold">
                    {formatPKR(car.price)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Rental duration</span>

                  <span className="font-semibold">
                    {rentalDays > 0
                      ? `${rentalDays} ${rentalDays === 1 ? "day" : "days"}`
                      : "Select dates"}
                  </span>
                </div>

                <div className="border-t border-neutral-200 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold">Estimated Total</span>

                    <span className="text-2xl font-black">
                      {formatPKR(totalPrice)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-neutral-500">
                    The final price is calculated again by the server using
                    the database car price.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 border border-neutral-200 bg-white p-5">
              <ShieldCheck className="shrink-0" size={26} />

              <div>
                <h3 className="font-bold">Secure Booking Request</h3>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Your booking details are submitted to the DRIVORA server.
                  Your reservation is not confirmed until approved.
                </p>

                <CheckCircle2 className="mt-3 text-neutral-400" size={20} />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
