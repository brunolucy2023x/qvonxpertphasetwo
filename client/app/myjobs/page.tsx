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

  const [activeTab, setActiveTab] = React.useState("posts");

  const router = useRouter();

  const userId = userProfile?._id;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "https://qvonxpert.com";

  // AUTH GUARD (SAFE)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`${baseUrl}/login`);
    }
  }, [isAuthenticated, loading, router]);

  // SAFE FILTER (LIKED JOBS)
  const likedJobs = jobs.filter((job: Job) => {
    if (!userId) return false;
    return job.likes?.includes(userId);
  });

  if (loading) return null;

  return (
    <div>
      <Header />

      <div className="mt-8 w-[90%] mx-auto flex flex-col">
        {/* TABS */}
        <div className="self-center flex items-center gap-6">
          <button
            className={`border px-8 py-2 rounded-full font-medium ${
              activeTab === "posts"
                ? "border-transparent bg-[#7263F3] text-white"
                : "border-gray-400"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            My Job Posts
          </button>

          <button
            className={`border px-8 py-2 rounded-full font-medium ${
              activeTab === "likes"
                ? "border-transparent bg-[#7263F3] text-white"
                : "border-gray-400"
            }`}
            onClick={() => setActiveTab("likes")}
          >
            Liked Jobs
          </button>
        </div>

        {/* EMPTY STATES */}
        {activeTab === "posts" && userJobs?.length === 0 && (
          <div className="mt-8">
            <p className="text-2xl font-bold">No job posts found.</p>
          </div>
        )}

        {activeTab === "likes" && likedJobs.length === 0 && (
          <div className="mt-8">
            <p className="text-2xl font-bold">No liked jobs found.</p>
          </div>
        )}

        {/* JOB LIST */}
        <div className="my-8 grid grid-cols-2 gap-6">
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