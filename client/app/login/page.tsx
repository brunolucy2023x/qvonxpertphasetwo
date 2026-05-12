"use client"; // MUST be first line

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/dashboard";

  const [authView, setAuthView] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const authContent = useMemo(() => {
    switch (authView) {
      case "signup":
        return {
          image: "/signupimage.jpg",
          heading: "Create Your Account",
          text: "Join QvonXpert and unlock career opportunities worldwide.",
        };
      case "forgot":
        return {
          image: "/forgetpassword.jpg",
          heading: "Forgot Password",
          text: "Enter your email to receive a password reset link.",
        };
      default:
        return {
          image: "/signinimage.jpg",
          heading: "Welcome Back",
          text: "Login to manage jobs, applications and your profile.",
        };
    }
  }, [authView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await new Promise((res) => setTimeout(res, 1200));
      if (authView === "forgot") {
        setSuccess("Password reset link sent to your email!");
      } else {
        router.push(redirect);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#f8fafc]">
      {/* ...rest of your JSX remains exactly the same... */}
    </div>
  );
}