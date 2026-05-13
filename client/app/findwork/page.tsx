"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import Filters from "@/Components/Filters";
import JobCard from "@/Components/JobItem/JobCard";
import { supabase } from "@/lib/supabase";
import { useGlobalContext } from "@/context/globalContext";
import type { Job } from "@/types/types";

import {
  Search,
  MapPin,
  Sparkles,
  Bookmark,
  ArrowUpRight,
  Briefcase,
  SlidersHorizontal,
  Flame,
  Clock3,
} from "lucide-react";

export default function Page() {
  const { userProfile } = useGlobalContext();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("All");

  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* =======================================================
      SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* =======================================================
      FETCH JOBS
  ======================================================= */

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error.message);
        return;
      }

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
        createdBy: job.created_by || {
          _id: "",
          profilePicture: "",
          name: "",
        },
        createdAt: job.created_at || new Date().toISOString(),
        updatedAt: job.updated_at || new Date().toISOString(),
      }));

      setJobs(mappedJobs);
    };

    fetchJobs();
  }, []);

  /* =======================================================
      FETCH USER DATA
  ======================================================= */

  useEffect(() => {
    if (!userProfile?._id) return;

    const fetchUserData = async () => {
      const { data: saved } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", userProfile._id);

      setSavedJobs(saved?.map((item) => item.job_id) || []);

      const { data: applied } = await supabase
        .from("applied_jobs")
        .select("job_id")
        .eq("user_id", userProfile._id);

      setAppliedJobs(applied?.map((item) => item.job_id) || []);
    };

    fetchUserData();
  }, [userProfile?._id]);

  /* =======================================================
      SAVE JOB
  ======================================================= */

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

  /* =======================================================
      APPLY JOB
  ======================================================= */

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

  /* =======================================================
      FILTER JOBS
  ======================================================= */

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const keyword = debouncedSearch.toLowerCase();

      const matchesKeyword =
        job.title?.toLowerCase().includes(keyword) ||
        job.createdBy?.name?.toLowerCase().includes(keyword) ||
        job.tags?.some((tag) => tag.toLowerCase().includes(keyword));

      const matchesLocation =
        !location ||
        job.location?.toLowerCase().includes(location.toLowerCase());

      const matchesType =
        type === "All" || !type || job.jobType?.includes(type);

      return matchesKeyword && matchesLocation && matchesType;
    });
  }, [jobs, debouncedSearch, location, type]);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <Header />

      {/* =======================================================
          HERO
      ======================================================= */}

      <section className="relative border-b border-white/10">
        {/* background */}

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-fuchsia-600/30 blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-sm text-gray-300">
              <Sparkles size={16} />
              AI Powered Career Discovery
            </div>

            <h1 className="mt-8 text-6xl md:text-7xl font-black leading-[0.95] tracking-tight">
              Find Work
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-blue-500">
                That Feels Future.
              </span>
            </h1>

            <p className="mt-8 text-lg text-gray-400 leading-8 max-w-2xl">
              Explore elite remote jobs, modern startups, and world-class tech
              teams in a completely redesigned experience.
            </p>

            {/* SEARCH BAR */}

            <div className="mt-14 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-5 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* search */}

                <div className="h-[64px] rounded-2xl bg-black/40 border border-white/10 px-5 flex items-center gap-3">
                  <Search className="text-gray-500" size={20} />

                  <input
                    type="text"
                    placeholder="Search futuristic jobs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent w-full outline-none text-sm placeholder:text-gray-500"
                  />
                </div>

                {/* location */}

                <div className="h-[64px] rounded-2xl bg-black/40 border border-white/10 px-5 flex items-center gap-3">
                  <MapPin className="text-gray-500" size={20} />

                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-transparent w-full outline-none text-sm placeholder:text-gray-500"
                  />
                </div>

                {/* type */}

                <div className="h-[64px] rounded-2xl bg-black/40 border border-white/10 px-5 flex items-center gap-3">
                  <Briefcase className="text-gray-500" size={20} />

                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-transparent w-full outline-none text-sm text-gray-300"
                  >
                    <option value="All">All Types</option>
                    <option value="Remote">Remote</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* button */}

                <button className="h-[64px] rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 text-white font-semibold hover:scale-[1.02] transition-all duration-300 shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                  Explore Jobs
                </button>
              </div>
            </div>

            {/* STATS */}

            <div className="mt-14 flex flex-wrap gap-10">
              <div>
                <h3 className="text-4xl font-black">12K+</h3>
                <p className="text-gray-500 mt-2 text-sm">
                  Active Opportunities
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-black">4.8★</h3>
                <p className="text-gray-500 mt-2 text-sm">
                  Candidate Satisfaction
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-black">850+</h3>
                <p className="text-gray-500 mt-2 text-sm">
                  Startup Companies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          CONTENT
      ======================================================= */}

      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* TOP BAR */}

        <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-fuchsia-400 text-sm mb-3">
              <Flame size={16} />
              Trending Careers
            </div>

            <h2 className="text-4xl font-black">
              Discover Opportunities
            </h2>

            <p className="text-gray-500 mt-3">
              {filteredJobs.length} jobs available worldwide
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="h-[52px] px-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition">
              <Clock3 size={16} />
              Newest
            </button>

            <button className="h-[52px] px-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition">
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* LAYOUT */}

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* SIDEBAR */}

          <aside>
            <div className="sticky top-24 rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Advanced Filters</h3>

                <SlidersHorizontal size={18} className="text-gray-400" />
              </div>

              <Filters />
            </div>
          </aside>

          {/* JOBS */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const isSaved = savedJobs.includes(job._id);
                const isApplied = appliedJobs.includes(job._id);

                return (
                  <div
                    key={job._id}
                    className="group relative rounded-[34px] border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] backdrop-blur-2xl overflow-hidden hover:border-fuchsia-500/40 transition-all duration-500"
                  >
                    {/* glow */}

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-fuchsia-500/10 via-transparent to-cyan-500/10" />

                    <div className="relative p-7">
                      {/* top */}

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-2xl font-black shadow-lg">
                            {job.title?.charAt(0)}
                          </div>

                          <div>
                            <h3 className="text-2xl font-bold leading-tight">
                              {job.title}
                            </h3>

                            <p className="text-gray-400 mt-2">
                              {job.createdBy?.name || "Modern Company"}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                              <span className="px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 text-xs border border-fuchsia-500/20">
                                {job.location || "Remote"}
                              </span>

                              {job.jobType?.slice(0, 2).map((item, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs border border-cyan-500/20"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* save */}

                        <button
                          onClick={() => toggleSave(job._id)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
                            isSaved
                              ? "bg-yellow-400 text-black"
                              : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          <Bookmark size={18} />
                        </button>
                      </div>

                      {/* description */}

                      <p className="mt-8 text-gray-400 leading-8 text-sm">
                        {job.description}
                      </p>

                      {/* tags */}

                      <div className="flex flex-wrap gap-3 mt-8">
                        {job.tags?.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs text-gray-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* custom card */}

                      <div className="mt-8">
                        <JobCard job={job} />
                      </div>

                      {/* footer */}

                      <div className="mt-10 flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">
                            Hiring Now
                          </p>

                          <h4 className="mt-2 text-lg font-bold">
                            Apply Instantly
                          </h4>
                        </div>

                        <button
                          onClick={() => applyJob(job._id)}
                          className={`h-[54px] px-7 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                            isApplied
                              ? "bg-green-500 text-black"
                              : "bg-white text-black hover:bg-fuchsia-500 hover:text-white"
                          }`}
                        >
                          {isApplied ? "Applied" : "Apply Now"}

                          <ArrowUpRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-20 text-center">
                <Search
                  size={60}
                  className="mx-auto text-gray-700 mb-6"
                />

                <h3 className="text-4xl font-black">
                  No Jobs Found
                </h3>

                <p className="text-gray-500 mt-5">
                  Try changing your filters or search query.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
