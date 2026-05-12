"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/dashboard";

  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
      DYNAMIC CONTENT
  ========================= */
  const authContent = useMemo(() => {
    if (isSignup) {
      return {
        image: "/signupimage.jpg",
        heading: "Create Your Account",
        text: "Join QvonXpert and unlock career opportunities worldwide.",
      };
    }

    return {
      image: "/signinimage.jpg",
      heading: "Welcome Back",
      text: "Login to manage jobs, applications and your profile.",
    };
  }, [isSignup]);

  /* =========================
      SUBMIT
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await new Promise((res) => setTimeout(res, 1200));
      router.push(redirect);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#f8fafc]">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =========================================
            LEFT SIDE (FORM)
        ========================================= */}
        <div className="flex items-center justify-center px-6 py-10">

          <div className="w-full max-w-md">

            {/* LOGO */}
            <div className="flex items-center gap-3 mb-8">

              <Image
                src="/logo.svg"
                alt="Logo"
                width={42}
                height={42}
                priority
              />

              <h1 className="text-2xl font-bold text-gray-900">
                QvonXpert
              </h1>

            </div>

            {/* TOGGLE */}
            <div className="mb-6 flex rounded-2xl bg-white p-2 shadow-sm border">

              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                  !isSignup
                    ? "bg-black text-white"
                    : "text-gray-500"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                  isSignup
                    ? "bg-black text-white"
                    : "text-gray-500"
                }`}
              >
                Sign Up
              </button>

            </div>

            {/* HEADER */}
            <div className="mb-6">

              <h2 className="text-3xl font-bold text-gray-900">
                {authContent.heading}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {authContent.text}
              </p>

            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* NAME */}
              {isSignup && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* FORGOT PASSWORD */}
              {!isSignup && (
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : isSignup
                  ? "Create Account"
                  : "Login"}
              </button>

            </form>

            {/* GOOGLE */}
            <button className="mt-5 w-full rounded-xl border bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Continue with Google
            </button>

            {/* SWITCH */}
            <div className="mt-6 text-center text-sm text-gray-500">

              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignup(false)}
                    className="font-semibold text-black hover:underline"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignup(true)}
                    className="font-semibold text-black hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              )}

            </div>

          </div>

        </div>

        {/* =========================================
            RIGHT SIDE IMAGE
        ========================================= */}
        <div className="relative hidden lg:block">

          <Image
            src={authContent.image}
            alt="Auth Image"
            fill
            className="object-cover"
            priority
          />

        </div>

      </div>

    </div>
  );
}