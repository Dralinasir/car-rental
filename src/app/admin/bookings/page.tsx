
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CarFront,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  car_id: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_city: string | null;
  pickup_date: string;
  return_date: string;
  total_days: number;
  price_per_day: string | number;
  total_price: string | number;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  car_name: string | null;
  car_brand: string | null;
};

const money = (value: string | number) =>
  `Rs. ${Number(value).toLocaleString("en-PK")}`;

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/bookings", {
        cache: "no-store",
      });
      const data = await response.json();

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load bookings");
      }

      setBookings(data.bookings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function updateStatus(
    id: number,
    status: "confirmed" | "rejected"
  ) {
    const action = status === "confirmed" ? "confirm" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} booking #${id}?`)) {
      return;
    }

    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update booking");
      }

      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Update failed"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const rejected = bookings.filter((b) => b.status === "rejected").length;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.3em] text-neutral-400">
              DRIVORA ADMIN
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Booking Management
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              View and manage customer rental requests.
            </p>
          </div>

          <button
            onClick={loadBookings}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Bookings", value: bookings.length, icon: CarFront },
            { label: "Pending", value: pending, icon: Clock },
            { label: "Confirmed", value: confirmed, icon: CheckCircle },
            { label: "Rejected", value: rejected, icon: XCircle },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-400">{item.label}</p>
                  <Icon size={20} className="text-neutral-300" />
                </div>
                <p className="mt-3 text-3xl font-bold">{item.value}</p>
              </div>
            );
          })}
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="border-b border-neutral-800 px-5 py-4">
            <h2 className="font-semibold">All Rental Requests</h2>
          </div>

          {loading ? (
            <p className="p-8 text-center text-neutral-400">
              Loading bookings...
            </p>
          ) : bookings.length === 0 ? (
            <p className="p-8 text-center text-neutral-400">
              No bookings found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-neutral-950 text-neutral-400">
                  <tr>
                    <th className="px-5 py-4">Booking</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Car</th>
                    <th className="px-5 py-4">Rental Period</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-neutral-800/40">
                      <td className="px-5 py-5 font-semibold">
                        #{booking.id}
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-medium">{booking.customer_name}</p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {booking.customer_phone}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {booking.customer_city || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p>{booking.car_name || `Car #${booking.car_id}`}</p>
                        <p className="text-xs text-neutral-400">
                          {booking.car_brand || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p>{String(booking.pickup_date).slice(0, 10)}</p>
                        <p className="text-xs text-neutral-400">
                          to {String(booking.return_date).slice(0, 10)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {booking.total_days} days
                        </p>
                      </td>

                      <td className="px-5 py-5 font-semibold">
                        {money(booking.total_price)}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            booking.status === "confirmed"
                              ? "bg-green-950 text-green-300"
                              : booking.status === "rejected"
                                ? "bg-red-950 text-red-300"
                                : "bg-yellow-950 text-yellow-300"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        {booking.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                updateStatus(booking.id, "confirmed")
                              }
                              disabled={updatingId === booking.id}
                              className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-neutral-200 disabled:opacity-50"
                            >
                              Confirm
                            </button>

                            <button
                              onClick={() =>
                                updateStatus(booking.id, "rejected")
                              }
                              disabled={updatingId === booking.id}
                              className="rounded-md border border-red-800 px-3 py-2 text-xs text-red-300 hover:bg-red-950 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500">
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-5 text-xs text-neutral-500">
          Booking status changes are saved directly to the database.
        </p>
      </div>
    </main>
  );
}
