import React from "react";
import Link from "next/link";

function Footer() {
  const year = new Date().getFullYear();

  const sections = [
    {
      title: "Explore",
      links: [
        { href: "/findwork", label: "Opportunities" },
        { href: "/dashboard", label: "Workspace" },
        { href: "/post", label: "Publish Role" },
      ],
    },
    {
      title: "Employers",
      links: [
        { href: "/post", label: "Post a Job" },
        { href: "/dashboard", label: "Manage Listings" },
      ],
    },
    {
      title: "Platform",
      links: [
        { href: "/", label: "Home" },
        { href: "/about", label: "About QvonXpert" },
        { href: "/contact", label: "Contact" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">

        {/* CTA */}
        <div className="mb-10 p-6 rounded-2xl bg-[#7263F3]/5 border border-[#7263F3]/10 text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Build your career with QvonXpert
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Discover opportunities, connect with employers, and grow your future.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <h2 className="text-xl font-extrabold text-[#7263F3]">
              QvonXpert
            </h2>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              A modern talent and opportunity platform connecting people,
              jobs, and career growth.
            </p>
          </div>

          {/* LINKS */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                {section.title}
              </h3>

              <ul className="space-y-2 text-sm text-gray-600">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-[#7263F3] transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-gray-200 my-10" />

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © {year} QvonXpert. All rights reserved.
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