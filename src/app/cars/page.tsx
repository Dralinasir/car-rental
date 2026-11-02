
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Users,
  Fuel,
  Settings2,
  CarFront,
} from "lucide-react";

type Car = {
  id: number | string;
  name: string;
  brand: string;
  category: string | null;
  transmission: string | null;
  fuel_type: string | null;
  seats: number | null;
  price_per_day: string | number;
  image_url: string | null;
  description: string | null;
  is_available: boolean;
};

const fallbackImages: Record<string, string> = {
  "Mercedes-Benz C-Class":
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=85",
  "BMW 5 Series":
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=85",
  "Toyota Land Cruiser":
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=85",
  "Porsche 911":
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85",
  "Range Rover Sport":
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=85",
  "Toyota Corolla":
    "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1000&q=85",
};

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCars() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/cars", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load cars.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.cars)) {
          throw new Error("Invalid cars data received.");
        }

        setCars(data.cars);
      } catch (err) {
        console.error("Cars loading error:", err);
        setError("Cars load nahi ho sakin. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, []);

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <header className="border-b border-neutral-200 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-[0.2em]">
            DRIVORA<span className="text-neutral-400">.</span>
          </Link>

          <Link href="/" className="text-sm font-semibold hover:text-neutral-500">
            <ArrowLeft className="mr-2 inline" size={17} />
            Back Home
          </Link>
        </div>
      </header>

      <section className="bg-neutral-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">
            Explore Our Collection
          </p>

          <h1 className="mt-5 text-5xl font-black md:text-6xl">
            Find Your Perfect Ride.
          </h1>

          <p className="mt-5 max-w-xl leading-8 text-neutral-300">
            Explore our collection of premium vehicles, designed to make every
            journey comfortable and memorable.
          </p>

          <div className="mt-8 flex items-center gap-3 text-sm text-neutral-400">
            <CarFront size={20} />
            {loading ? "Loading vehicles..." : `${cars.length} vehicles in our collection`}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">Available Cars</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Choose a vehicle that suits your journey.
            </p>
          </div>

          <span className="border border-neutral-200 px-5 py-3 text-sm">
            All Vehicles
          </span>
        </div>

        {loading && (
          <div className="py-20 text-center text-neutral-500">
            Loading cars from DRIVORA database...
          </div>
        )}

        {!loading && error && (
          <div className="border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-black px-6 py-3 text-sm font-bold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cars.length === 0 && (
          <div className="py-20 text-center text-neutral-500">
            No cars are currently available.
          </div>
        )}

        {!loading && !error && cars.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => {
              const image =
                car.image_url || fallbackImages[car.name] ||
                "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85";

              return (
                <article
                  key={car.id}
                  className="group overflow-hidden border border-neutral-200 transition hover:shadow-xl"
                >
                  <div className="relative h-56 overflow-hidden bg-neutral-100">
                    <img
                      src={image}
                      alt={car.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <span className="absolute left-4 top-4 bg-white px-4 py-2 text-xs font-bold uppercase">
                      {car.category || "Vehicle"}
                    </span>
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-semibold text-neutral-400">
                      {car.brand}
                    </p>

                    <h3 className="mt-2 text-xl font-bold">{car.name}</h3>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-y border-neutral-100 py-5 text-sm text-neutral-500">
                      <span>
                        <Users className="mr-2 inline" size={16} />
                        {car.seats ?? "N/A"} Seats
                      </span>

                      <span>
                        <Fuel className="mr-2 inline" size={16} />
                        {car.fuel_type || "N/A"}
                      </span>

                      <span>
                        <Settings2 className="mr-2 inline" size={16} />
                        {car.transmission || "N/A"}
                      </span>

                      <span>
                        <CarFront className="mr-2 inline" size={16} />
                        {car.category || "Vehicle"}
                      </span>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-400">Rental Price</p>

                        <p className="mt-1 text-xl font-black">
                          Rs.{" "}
                          {Number(car.price_per_day).toLocaleString("en-PK")}
                          <span className="text-xs font-normal text-neutral-500">
                            {" "}/day
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/booking/${car.id}`}
                        className="bg-black px-4 py-3 text-sm font-bold text-white hover:bg-neutral-700"
                      >
                        Book Now{" "}
                        <ArrowUpRight className="ml-1 inline" size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-neutral-200 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 text-sm text-neutral-500">
          <span className="font-black tracking-widest text-black">
            DRIVORA.
          </span>
          <span>
            © {new Date().getFullYear()} DRIVORA. All rights reserved.
          </span>
        </div>
      </footer>
    </main>
  );
}
