
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from "lucide-react";

const cars = [
  {
    name: "Mercedes-Benz C-Class",
    category: "Luxury Sedan",
    price: "18,000",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=85",
    seats: "5 Seats",
    transmission: "Automatic",
  },
  {
    name: "BMW 5 Series",
    category: "Executive Sedan",
    price: "22,000",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=85",
    seats: "5 Seats",
    transmission: "Automatic",
  },
  {
    name: "Toyota Land Cruiser",
    category: "Premium SUV",
    price: "35,000",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=85",
    seats: "7 Seats",
    transmission: "Automatic",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-black tracking-[0.2em]">
            DRIVORA<span className="text-neutral-400">.</span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium md:flex">
            <Link href="/" className="hover:text-neutral-500">Home</Link>
            <Link href="/cars" className="hover:text-neutral-500">Our Cars</Link>
            <Link href="/contact" className="hover:text-neutral-500">Contact</Link>
          </div>

          <Link
            href="/cars"
            className="bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
          >
            Book a Car <ArrowUpRight className="ml-2 inline" size={16} />
          </Link>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0 opacity-35">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=90"
            alt="Luxury sports car"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-28 md:grid-cols-2 md:py-36">
          <div>
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-neutral-300">
              Premium Car Rental Experience
            </p>
            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Your Journey.
              <br />
              Your <span className="text-neutral-400">Drive.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-neutral-300">
              Discover premium vehicles, flexible rentals and an effortless
              booking experience. Your next journey starts here.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/cars"
                className="bg-white px-8 py-4 font-bold text-black transition hover:bg-neutral-200"
              >
                Explore Cars <ArrowRight className="ml-2 inline" size={18} />
              </Link>
              <Link
                href="/contact"
                className="border border-white/50 px-8 py-4 font-semibold text-white hover:bg-white hover:text-black"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="hidden md:flex justify-end">
            <div className="border border-white/30 bg-black/30 p-8 backdrop-blur-md">
              <p className="text-sm uppercase tracking-widest text-neutral-300">
                Drive without limits
              </p>
              <p className="mt-4 text-4xl font-bold">Premium.</p>
              <p className="mt-1 text-4xl font-bold text-neutral-400">
                Comfortable.
              </p>
              <p className="mt-1 text-4xl font-bold">Reliable.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-3">
        {[
          { icon: CarFront, title: "Premium Fleet", text: "Quality vehicles for every journey." },
          { icon: ShieldCheck, title: "Reliable Service", text: "A simple and transparent rental experience." },
          { icon: CalendarDays, title: "Flexible Booking", text: "Choose dates that suit your plans." },
        ].map((item) => (
          <div key={item.title} className="flex gap-5 border border-neutral-200 p-7">
            <item.icon size={30} strokeWidth={1.5} />
            <div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{item.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Our Collection
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Featured Vehicles
            </h2>
          </div>
          <Link href="/cars" className="hidden font-semibold hover:text-neutral-500 md:block">
            View all cars <ArrowRight className="ml-2 inline" size={17} />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {cars.map((car) => (
            <article key={car.name} className="group overflow-hidden border border-neutral-200">
              <div className="h-60 overflow-hidden bg-neutral-100">
                <img
                  src={car.image}
                  alt={car.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  {car.category}
                </p>
                <h3 className="mt-2 text-xl font-bold">{car.name}</h3>
                <div className="mt-5 flex justify-between text-xs text-neutral-500">
                  <span>{car.seats}</span>
                  <span>{car.transmission}</span>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-5">
                  <div>
                    <p className="text-xs text-neutral-500">Starting from</p>
                    <p className="mt-1 text-xl font-black">
                      Rs. {car.price}
                      <span className="text-xs font-normal text-neutral-500"> / day</span>
                    </p>
                  </div>
                  <Link
                    href="/cars"
                    className="bg-black p-3 text-white transition hover:bg-neutral-700"
                    aria-label={`Explore ${car.name}`}
                  >
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-neutral-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">
                Why DRIVORA
              </p>
              <h2 className="mt-4 text-4xl font-black md:text-5xl">
                More Than Just a Ride.
              </h2>
              <p className="mt-6 max-w-lg leading-8 text-neutral-400">
                We make renting a car straightforward. Explore our fleet,
                choose your dates and send your booking request with confidence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Users, title: "Customer First", text: "Service focused on your needs." },
                { icon: Zap, title: "Easy Booking", text: "A simple booking experience." },
                { icon: ShieldCheck, title: "Transparent", text: "Clear rental pricing." },
                { icon: Star, title: "Quality Fleet", text: "Vehicles for different needs." },
              ].map((item) => (
                <div key={item.title} className="border border-white/20 p-5">
                  <item.icon size={26} />
                  <h3 className="mt-4 font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-neutral-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl font-black">Ready for Your Next Journey?</h2>
        <p className="mt-4 text-neutral-500">
          Find your perfect car and start planning your trip today.
        </p>
        <Link
          href="/cars"
          className="mt-8 inline-flex items-center bg-black px-9 py-4 font-bold text-white hover:bg-neutral-700"
        >
          Browse Our Cars <ArrowRight className="ml-2" size={18} />
        </Link>
      </section>

      <footer className="border-t border-neutral-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row">
          <div>
            <p className="text-xl font-black tracking-[0.2em]">DRIVORA.</p>
            <p className="mt-2 text-sm text-neutral-500">Your Journey, Your Drive.</p>
          </div>
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} DRIVORA. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
