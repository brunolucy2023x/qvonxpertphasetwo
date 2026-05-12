"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/dashboard";

  // State to handle which auth view is active
  const [authView, setAuthView] = useState<"login" | "signup" | "forgot">("login");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Form feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================
      DYNAMIC CONTENT
  ========================= */
  const authContent = useMemo(() => {
    if (authView === "signup") {
      return {
        image: "/signupimage.jpg",
        heading: "Create Your Account",
        text: "Join QvonXpert and unlock career opportunities worldwide.",
      };
    }

    if (authView === "forgot") {
      return {
        image: "/forgetpassword.jpg",
        heading: "Forgot Password",
        text: "Enter your email to receive a password reset link.",
      };
    }

    // default is login
    return {
      image: "/signinimage.jpg",
      heading: "Welcome Back",
      text: "Login to manage jobs, applications and your profile.",
    };
  }, [authView]);

  /* =========================
      SUBMIT HANDLER
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Simulate API delay
      await new Promise((res) => setTimeout(res, 1200));

      if (authView === "forgot") {
        setSuccess("Password reset link sent to your email!");
      } else {
        router.push(redirect);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#f8fafc]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ===============================
            LEFT SIDE FORM
        =============================== */}
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            {/* LOGO */}
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="flex items-center gap-3">
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
              </Link>
            </div>

            {/* BACK TO HOME */}
            <div className="mb-6">
              <Link href="/" className="text-sm text-gray-500 hover:underline">
                &larr; Back to Home
              </Link>
            </div>

            {/* TOGGLE (Login/Signup only) */}
            {authView !== "forgot" && (
              <div className="mb-6 flex rounded-2xl bg-white p-2 shadow-sm border">
                <button
                  type="button"
                  onClick={() => setAuthView("login")}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                    authView === "login" ? "bg-black text-white" : "text-gray-500"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthView("signup")}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                    authView === "signup" ? "bg-black text-white" : "text-gray-500"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* HEADER */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{authContent.heading}</h2>
              <p className="mt-2 text-sm text-gray-500">{authContent.text}</p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}
              {authView === "signup" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
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
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* PASSWORD */}
              {(authView === "login" || authView === "signup") && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              {/* FORGOT PASSWORD LINK */}
              {authView === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAuthView("forgot")}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* ERROR */}
              {error && <div className="text-sm text-red-500">{error}</div>}

              {/* SUCCESS */}
              {success && <div className="text-sm text-green-500">{success}</div>}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : authView === "signup"
                  ? "Create Account"
                  : authView === "forgot"
                  ? "Send Reset Link"
                  : "Login"}
              </button>
            </form>

            {/* GOOGLE BUTTON */}
            {(authView === "login" || authView === "signup") && (
              <button className="mt-5 w-full rounded-xl border bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Continue with Google
              </button>
            )}

            {/* SWITCH LINKS */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {authView === "signup" && (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthView("login")}
                    className="font-semibold text-black hover:underline"
                  >
                    Login
                  </button>
                </>
              )}
              {authView === "login" && (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthView("signup")}
                    className="font-semibold text-black hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              )}
              {authView === "forgot" && (
                <>
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthView("login")}
                    className="font-semibold text-black hover:underline"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

        {/* ===============================
            RIGHT SIDE IMAGE
        =============================== */}
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