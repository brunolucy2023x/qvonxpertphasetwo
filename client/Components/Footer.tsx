import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">

        {/* ================= CTA STRIP ================= */}
        <div className="mb-10 p-6 rounded-2xl bg-[#7263F3]/5 border border-[#7263F3]/10 text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Build your career with QvonXpert
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Discover opportunities, connect with employers, and grow your future.
          </p>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <h2 className="text-xl font-extrabold text-[#7263F3]">
              QvonXpert
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              A modern talent and opportunity platform connecting people,
              jobs, and career growth in one ecosystem.
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/findwork" className="hover:text-[#7263F3] transition">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#7263F3] transition">
                  Workspace
                </Link>
              </li>
              <li>
                <Link href="/post" className="hover:text-[#7263F3] transition">
                  Publish Role
                </Link>
              </li>
            </ul>
          </div>

          {/* EMPLOYERS */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Employers
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/post" className="hover:text-[#7263F3] transition">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#7263F3] transition">
                  Manage Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* PLATFORM */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-[#7263F3] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#7263F3] transition">
                  About QvonXpert
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#7263F3] transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ================= DIVIDER ================= */}
        <div className="border-t border-gray-200 my-10" />

        {/* ================= BOTTOM ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} QvonXpert. All rights reserved.
          </p>

          <p className="text-xs text-gray-400">
            Talent • Jobs • Opportunities • Growth
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;