"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/dashboard";

  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================
      DYNAMIC IMAGE + TEXT
  ========================================= */
  const authContent = useMemo(() => {
    if (isSignup) {
      return {
        image: "/signupimage.jpg",
        title: "Start Your Career Journey Today",
        description:
          "Create your account and unlock thousands of opportunities from top companies around the world.",
      };
    }

    return {
      image: "/signinimage.jpg",
      title: "Welcome Back to QvonXpert",
      description:
        "Login to continue exploring jobs, managing applications, and growing your professional career.",
    };
  }, [isSignup]);

  /* =========================================
      SUBMIT
  ========================================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // =========================================
      // CONNECT YOUR API HERE
      // =========================================
      await new Promise((resolve) => setTimeout(resolve, 1200));

      router.push(redirect);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      <div className="grid lg:grid-cols-2 min-h-screen">

        {/* =======================================
            LEFT SIDE IMAGE
        ======================================= */}
        <div className="relative hidden lg:block overflow-hidden">

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/45 z-10" />

          {/* IMAGE */}
          <Image
            src={authContent.image}
            alt="Authentication Image"
            fill
            priority
            className="object-cover transition-all duration-500"
          />

          {/* CONTENT */}
          <div className="absolute z-20 bottom-16 left-16 right-10 text-white">

            <div className="max-w-xl">

              <h1 className="text-5xl font-bold leading-tight">
                {authContent.title}
              </h1>

              <p className="mt-6 text-lg text-gray-200 leading-8">
                {authContent.description}
              </p>

            </div>

          </div>

        </div>

        {/* =======================================
            RIGHT SIDE FORM
        ======================================= */}
        <div className="flex items-center justify-center px-6 py-10 bg-white">

          <div className="w-full max-w-md">

            {/* LOGO / HEADER */}
            <div className="mb-10">

              <h2 className="text-4xl font-bold tracking-tight">
                QvonXpert
              </h2>

              <p className="text-gray-500 mt-3 text-base">
                {isSignup
                  ? "Create your account and get started"
                  : "Welcome back, login to continue"}
              </p>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* FULL NAME */}
              {isSignup && (
                <div>

                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignup}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-black transition"
                  />

                </div>
              )}

              {/* EMAIL */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-black transition"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-black transition"
                />

              </div>

              {/* FORGOT PASSWORD */}
              {!isSignup && (
                <div className="flex justify-end">

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-black hover:underline"
                  >
                    Forgot Password?
                  </Link>

                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3.5 rounded-2xl font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : isSignup
                  ? "Create Account"
                  : "Login"}
              </button>

            </form>

            {/* DIVIDER */}
            <div className="relative my-8">

              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">
                  OR
                </span>
              </div>

            </div>

            {/* GOOGLE BUTTON */}
            <button
              className="w-full border border-gray-300 rounded-2xl py-3.5 font-medium hover:bg-gray-50 transition"
            >
              Continue with Google
            </button>

            {/* TOGGLE */}
            <div className="mt-8 text-center text-sm text-gray-600">

              {isSignup ? (
                <>
                  Already have an account?{" "}

                  <button
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

      </div>

    </div>
  );
}

export default LoginPage;