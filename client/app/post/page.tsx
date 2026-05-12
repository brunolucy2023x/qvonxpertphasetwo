"use client";

import Header from "@/Components/Header";
import JobForm from "@/Components/JobPost/JobForm";
import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function Page() {
  const { isAuthenticated, loading } = useGlobalContext();
  const router = useRouter();

  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

  // =========================
  // AUTH GUARD (SUPABASE SAFE)
  // =========================
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // Redirect to login with "redirect" query
      const redirectUrl = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, loading, router, pathname]);

  // =========================
  // LOADING STATE (PREVENT FLASH)
  // =========================
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* PAGE TITLE */}
      <div className="w-[90%] mx-auto pt-8">
        <h2 className="text-3xl font-bold text-black">Create a Job Post</h2>
        <p className="text-gray-500 mt-1">
          Post your job directly to Supabase database
        </p>
      </div>

      {/* FORM AREA */}
      <div className="flex-1 w-[90%] mx-auto flex justify-center items-start pt-10">
        <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-sm border">
          <JobForm />
        </div>
      </div>
    </div>
  );
}

export default Page;