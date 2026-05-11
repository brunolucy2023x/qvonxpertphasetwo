"use client";

import React from "react";
import { useGlobalContext } from "@/context/globalContext";
import { LogIn, UserPlus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Profile from "./Profile";

function Header() {
  const { isAuthenticated } = useGlobalContext();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = React.useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL || "https://qvonxpert.com";

  const handleLogin = () => {
    router.push(`${baseUrl}/login`);
  };

  const navLinks = [
    { href: "/findwork", label: "Opportunities" },
    { href: "/dashboard", label: "Workspace" },
    { href: "/post", label: "Publish" },
  ];

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-300 ${
        scrolled ? "bg-white/90 shadow-sm" : "bg-white/60"
      }`}
    >
      {/* BRAND */}
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.svg" alt="logo" width={40} height={40} />

        <div className="flex flex-col leading-tight">
          <h1 className="font-extrabold text-xl text-[#7263F3]">
            QvonXpert
          </h1>
          <span className="text-[10px] text-gray-500">
            Talent • Jobs • Growth
          </span>
        </div>
      </Link>

      {/* SEARCH */}
      <div className="hidden lg:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl text-sm text-gray-500 w-64">
        <Search className="w-4 h-4" />
        <input
          placeholder="Search talent or jobs..."
          className="bg-transparent outline-none w-full"
        />
      </div>

      {/* NAV */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 text-sm font-medium ${
                isActive
                  ? "text-[#7263F3]"
                  : "text-gray-600 hover:text-[#7263F3]"
              }`}
            >
              {link.label}

              <span
                className={`absolute left-2 right-2 -bottom-1 h-[2px] rounded-full ${
                  isActive ? "bg-[#7263F3]" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* ACTIONS */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <Profile />
        ) : (
          <>
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-[#7263F3]"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>

            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-[#7263F3] text-white"
            >
              <UserPlus className="w-4 h-4" />
              Join Platform
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;