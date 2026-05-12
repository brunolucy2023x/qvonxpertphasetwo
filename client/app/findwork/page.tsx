"use client";

import Filters from "@/Components/Filters";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import JobCard from "@/Components/JobItem/JobCard";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useGlobalContext } from "@/context/globalContext";
import type { Job } from "@/types/types"; // ✅ import the correct Job type

export default function Page() {
  const { userProfile } = useGlobalContext();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [columns, setColumns] = useState<number>(3);

  const [search, setSearch] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [type, setType] = useState<string>("");

  const [sort, setSort] = useState<string>("relevant");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // =========================
  // FETCH JOBS FROM SUPABASE
  // =========================
  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error fetching jobs:", error.message);
        setJobs([]);
      } else {
        // Map Supabase fields to our Job type
        const mappedJobs: Job[] = (data || []).map((job: any) => ({
          _id: job.id || job._id,
          title: job.title || "",
          description: job.description || "",
          location: job.location || "",
          salary: job.salary || 0,
          salaryType: job.salary_type || "Yearly",
          negotiable: job.negotiable || false,
          jobType: job.job_type || [],
          tags: job.tags || [],
          likes: job.likes || [],
          skills: job.skills || [],
          applicants: job.applicants || [],
          createdBy: job.created_by || { _id: "", profilePicture: "", name: "" },
          createdAt: job.created_at || new Date().toISOString(),
          updatedAt: job.updated_at || new Date().toISOString(),
        }));

        setJobs(mappedJobs);
      }
    };

    fetchJobs();
  }, []);

  // =========================
  // FETCH SAVED + APPLIED JOBS
  // =========================
  useEffect(() => {
    if (!userProfile?._id) return;

    const fetchUserJobs = async () => {
      const { data: saved } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", userProfile._id);

      setSavedJobs(saved?.map((s) => s.job_id) || []);

      const { data: applied } = await supabase
        .from("applied_jobs")
        .select("job_id")
        .eq("user_id", userProfile._id);

      setAppliedJobs(applied?.map((a) => a.job_id) || []);
    };

    fetchUserJobs();
  }, [userProfile?._id]);

  const toggleSave = async (jobId: string) => {
    if (!userProfile?._id) return;

    if (savedJobs.includes(jobId)) {
      await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", userProfile._id)
        .eq("job_id", jobId);

      setSavedJobs(savedJobs.filter((id) => id !== jobId));
    } else {
      await supabase.from("saved_jobs").insert({
        user_id: userProfile._id,
        job_id: jobId,
      });

      setSavedJobs([...savedJobs, jobId]);
    }
  };

  const applyJob = async (jobId: string) => {
    if (!userProfile?._id) return;

    if (!appliedJobs.includes(jobId)) {
      await supabase.from("applied_jobs").insert({
        user_id: userProfile._id,
        job_id: jobId,
      });

      setAppliedJobs([...appliedJobs, jobId]);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const keyword = debouncedSearch.toLowerCase();

    const matchesKeyword =
      job.title?.toLowerCase().includes(keyword) ||
      job.createdBy?.name?.toLowerCase().includes(keyword) ||
      job.tags?.some((t) => t.toLowerCase().includes(keyword));

    const matchesLocation =
      !location || job.location?.toLowerCase().includes(location.toLowerCase());

    const matchesType =
      !type || type === "All" || job.jobType?.includes(type);

    return matchesKeyword && matchesLocation && matchesType;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  return (
    <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <Header />
      {/* ... keep your design exactly the same ... */}

      {/* JOB LIST */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-[280px] w-full">
            <div className="lg:sticky lg:top-24 bg-white/70 border p-5 rounded-2xl shadow-lg">
              <Filters />
            </div>
          </aside>

          <div
            className={`flex-1 grid gap-6 ${
              columns === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : columns === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {sortedJobs.length > 0 ? (
              sortedJobs.map((job) => (
                <div
                  key={job._id}
                  className="transition hover:scale-[1.02] hover:shadow-xl relative"
                >
                  {/* SAVE BUTTON */}
                  <button
                    onClick={() => toggleSave(job._id)}
                    className="absolute top-3 right-3 z-10 text-xl"
                  >
                    {savedJobs.includes(job._id) ? "⭐" : "☆"}
                  </button>

                  <JobCard job={job} /> {/* ✅ no more red line */}

                  {/* APPLY BUTTON */}
                  <button
                    onClick={() => applyJob(job._id)}
                    className={`mt-2 w-full py-2 rounded-lg text-sm ${
                      appliedJobs.includes(job._id)
                        ? "bg-green-500 text-white"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {appliedJobs.includes(job._id) ? "Applied ✅" : "Apply Now"}
                  </button>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No jobs found
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}