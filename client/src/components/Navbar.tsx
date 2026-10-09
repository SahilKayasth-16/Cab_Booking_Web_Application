"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

type Role = "rider" | "driver";

export default function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const role = user?.publicMetadata?.role as Role | undefined;
  const links = role
    ? [
        { href: `/${role}`, label: "Dashboard" },
        { href: `/${role}/profile`, label: "Profile" },
      ]
    : [];

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      pathname === href ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={role ? `/${role}` : "/"} className="text-lg font-bold">
            Cab Booking
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoaded && !isSignedIn && (
            <>
              <SignInButton />
              <SignUpButton>
                <button className="h-10 rounded-full bg-black px-5 text-sm font-medium text-white">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}

          {isLoaded && isSignedIn && (
            <>
              {role && (
                <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700 sm:inline">
                  {role}
                </span>
              )}
              <UserButton />
              {links.length > 0 && (
                <button
                  onClick={() => setOpen((o) => !o)}
                  aria-label="Toggle menu"
                  aria-expanded={open}
                  className="rounded-lg border px-3 py-2 text-sm md:hidden"
                >
                  {open ? "Close" : "Menu"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {open && links.length > 0 && (
        <nav className="flex flex-col gap-1 border-t px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={linkClass(l.href)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}