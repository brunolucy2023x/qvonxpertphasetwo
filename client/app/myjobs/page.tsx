"use client";

import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import MyJob from "@/Components/JobItem/MyJob";
import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function Page() {
  const { userJobs, jobs } = useJobsContext();
  const { isAuthenticated, loading, userProfile } = useGlobalContext();

  const [activeTab, setActiveTab] = React.useState<"posts" | "likes">("posts");
  const router = useRouter();

  // =========================
  // SUPABASE USER ID
  // =========================
  const userId = userProfile?.auth0_id || userProfile?.id;

  // =========================
  // AUTH GUARD
  // =========================
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const redirectUrl = encodeURIComponent(window.location.pathname);
      router.replace(`/login?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, loading, router]);

  // =========================
  // SUPABASE LIKED JOBS
  // =========================
  const likedJobs = React.useMemo(() => {
    if (!userId) return [];
    return (jobs || []).filter((job: Job) => job?.likes?.includes(userId));
  }, [jobs, userId]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div className="mt-8 w-[90%] mx-auto flex flex-col">
        {/* ================= TABS ================= */}
        <div className="self-center flex items-center gap-6">
          <button
            className={`border px-8 py-2 rounded-full font-medium transition ${
              activeTab === "posts"
                ? "border-transparent bg-[#7263F3] text-white"
                : "border-gray-400"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            My Job Posts
          </button>

          <button
            className={`border px-8 py-2 rounded-full font-medium transition ${
              activeTab === "likes"
                ? "border-transparent bg-[#7263F3] text-white"
                : "border-gray-400"
            }`}
            onClick={() => setActiveTab("likes")}
          >
            Liked Jobs
          </button>
        </div>

        {/* ================= EMPTY STATES ================= */}
        {activeTab === "posts" && (!userJobs || userJobs.length === 0) && (
          <div className="mt-8 text-center">
            <p className="text-2xl font-bold">No job posts found.</p>
            <p className="text-gray-500">Create your first job on Supabase.</p>
          </div>
        )}

        {activeTab === "likes" && likedJobs.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-2xl font-bold">No liked jobs found.</p>
            <p className="text-gray-500">Start exploring jobs.</p>
          </div>
        )}

        {/* ================= JOB LIST ================= */}
        <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === "posts" &&
            userJobs?.map((job: Job) => (
              <MyJob key={job._id} job={job} />
            ))}

          {activeTab === "likes" &&
            likedJobs.map((job: Job) => (
              <MyJob key={job._id} job={job} />
            ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Page;