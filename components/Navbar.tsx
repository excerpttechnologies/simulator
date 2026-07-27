"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWordmark, setShowWordmark] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // show wordmark when hero is NOT intersecting (scrolled past)
          setShowWordmark(!entry.isIntersecting);
        });
      },
      { root: null, threshold: 0, rootMargin: "-80px" }
    );

    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const nav = [
    { label: "Services", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
    { label: "Insights", href: "#insights" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className={`transition-opacity duration-500 ${
                showWordmark ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!showWordmark}
            >
              <span className="font-black text-xl tracking-tight text-[#0A0A0A]">Accountin.</span>
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <div className="bg-[#F0F0F0] rounded-full px-6 py-2 flex gap-6 items-center">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <a href="#" className="text-sm text-gray-700 hover:text-black">
                Login
              </a>
            </div>

            <button className="hidden sm:inline-flex items-center gap-2 bg-black text-white rounded-full px-5 py-2 text-sm font-medium">
              Get Started →
            </button>

            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMenuOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col gap-3">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a href="#" className="text-sm font-medium text-gray-700 py-2">
                Login
              </a>
              <button className="w-full bg-black text-white rounded-full px-4 py-2 text-sm font-medium">
                Get Started →
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
