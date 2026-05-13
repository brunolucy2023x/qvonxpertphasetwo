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
  Briefcase,
  LayoutGrid,
  Rows3,
  Sparkles,
  Bookmark,
  Clock3,
  ChevronDown,
  SlidersHorizontal,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react";

export default function Page() {
  const { userProfile } = useGlobalContext();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [columns, setColumns] = useState<number>(3);

  const [search, setSearch] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [type, setType] = useState<string>("All");

  const [sort, setSort] = useState<string>("newest");

  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  /* =========================================================
     DEBOUNCE
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /* =========================================================
     FETCH JOBS
  ========================================================= */

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error.message);
        setJobs([]);
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

  /* =========================================================
     FETCH SAVED + APPLIED
  ========================================================= */

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

  /* =========================================================
     SAVE JOB
  ========================================================= */

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

  /* =========================================================
     APPLY JOB
  ========================================================= */

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

  /* =========================================================
     FILTER
  ========================================================= */

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

  /* =========================================================
     SORT
  ========================================================= */

  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (sort === "newest") {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      }

      return 0;
    });
  }, [filteredJobs, sort]);

  return (
    <main className="relative overflow-hidden bg-[#050816] text-white min-h-screen">
      {/* =========================================================
          BACKGROUND EFFECTS
      ========================================================= */}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-250px] left-[-250px] w-[500px] h-[500px] bg-violet-700/30 rounded-full blur-[140px]" />

        <div className="absolute bottom-[-300px] right-[-200px] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[160px]" />

        <div className="absolute top-[30%] right-[15%] w-[200px] h-[200px] bg-pink-500/20 rounded-full blur-[100px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_35%)]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* =========================================================
            HERO
        ========================================================= */}

        <section className="relative pt-20 pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              {/* LEFT */}

              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8">
                  <Sparkles className="w-4 h-4 text-cyan-400" />

                  <span className="text-sm text-gray-200">
                    Modern AI Powered Job Discovery
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
                  Find Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">
                    Dream Career
                  </span>
                </h1>

                <p className="mt-8 text-lg text-gray-300 leading-8 max-w-2xl">
                  Discover premium opportunities from world-class companies.
                  Beautiful experience. Fast search. Smart matching.
                </p>

                {/* SEARCH BAR */}

                <div className="mt-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[30px] p-5 shadow-[0_0_80px_rgba(139,92,246,0.15)]">
                  <div className="grid lg:grid-cols-3 gap-4">
                    {/* SEARCH */}

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 h-[64px]">
                      <Search className="w-5 h-5 text-cyan-400" />

                      <input
                        type="text"
                        placeholder="Job title or keyword"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent outline-none w-full text-white placeholder:text-gray-500"
                      />
                    </div>

                    {/* LOCATION */}

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 h-[64px]">
                      <MapPin className="w-5 h-5 text-pink-400" />

                      <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-transparent outline-none w-full text-white placeholder:text-gray-500"
                      />
                    </div>

                    {/* TYPE */}

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 h-[64px]">
                      <Briefcase className="w-5 h-5 text-violet-400" />

                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="bg-transparent outline-none w-full text-white"
                      >
                        <option className="bg-black">All</option>

                        <option className="bg-black">Remote</option>

                        <option className="bg-black">Full-Time</option>

                        <option className="bg-black">Part-Time</option>

                        <option className="bg-black">Contract</option>
                      </select>
                    </div>
                  </div>

                  {/* BUTTONS */}

                  <div className="flex flex-wrap gap-4 mt-5">
                    <button className="h-[56px] px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 font-semibold hover:scale-[1.02] transition-all duration-300 shadow-[0_20px_40px_rgba(34,211,238,0.3)]">
                      Explore Jobs
                    </button>

                    <button className="h-[56px] px-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
                      Trending Companies
                    </button>
                  </div>
                </div>

                {/* STATS */}

                <div className="grid grid-cols-3 gap-5 mt-10">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
                    <h3 className="text-3xl font-black text-cyan-400">
                      10K+
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      Active Positions
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
                    <h3 className="text-3xl font-black text-pink-400">
                      4K+
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      Companies Hiring
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
                    <h3 className="text-3xl font-black text-violet-400">
                      98%
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      Success Match
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <div className="relative">
                <div className="relative rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-3xl p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />

                  <div className="relative space-y-6">
                    {/* CARD 1 */}

                    <div className="rounded-3xl bg-[#0d1228] border border-white/10 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 mb-4" />

                          <h3 className="text-2xl font-bold">
                            Senior UI Designer
                          </h3>

                          <p className="text-gray-400 mt-2">
                            Creative Digital Studio
                          </p>
                        </div>

                        <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm">
                          Remote
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6 flex-wrap">
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                          Figma
                        </span>

                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                          UX
                        </span>

                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                          UI
                        </span>
                      </div>

                      <button className="mt-6 w-full h-[56px] rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 font-semibold">
                        View Position
                      </button>
                    </div>

                    {/* CARD 2 */}

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600" />

                          <div>
                            <h4 className="font-semibold">
                              Frontend Engineer
                            </h4>

                            <p className="text-sm text-gray-400">
                              Tech Startup
                            </p>
                          </div>
                        </div>

                        <CheckCircle2 className="text-emerald-400" />
                      </div>
                    </div>

                    {/* CARD 3 */}

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-600" />

                          <div>
                            <h4 className="font-semibold">
                              Product Manager
                            </h4>

                            <p className="text-sm text-gray-400">
                              AI Innovation Lab
                            </p>
                          </div>
                        </div>

                        <Bookmark className="text-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FLOATING */}

                <div className="absolute -bottom-10 -left-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-5 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                      <Flame className="w-6 h-6" />
                    </div>

                    <div>
                      <h4 className="font-bold text-xl">Fast Hiring</h4>

                      <p className="text-gray-400 text-sm">
                        Smart matching system
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            MAIN CONTENT
        ========================================================= */}

        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* TOP BAR */}

            <div className="mb-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
              <div className="flex flex-col xl:flex-row gap-6 xl:items-center xl:justify-between">
                {/* LEFT */}

                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>

                    <div>
                      <h2 className="text-3xl font-black">
                        Available Opportunities
                      </h2>

                      <p className="text-gray-400 mt-1">
                        {sortedJobs.length} jobs available right now
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}

                <div className="flex flex-wrap gap-4">
                  {/* SORT */}

                  <div className="h-[54px] px-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Clock3 className="w-4 h-4 text-cyan-400" />

                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="bg-transparent outline-none text-white"
                    >
                      <option className="bg-black" value="newest">
                        Newest
                      </option>

                      <option className="bg-black" value="relevant">
                        Relevant
                      </option>
                    </select>

                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* GRID */}

                  <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <button
                      onClick={() => setColumns(3)}
                      className={`w-14 h-14 flex items-center justify-center transition-all ${
                        columns === 3
                          ? "bg-gradient-to-r from-cyan-500 to-violet-600"
                          : "bg-transparent"
                      }`}
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setColumns(2)}
                      className={`w-14 h-14 flex items-center justify-center transition-all ${
                        columns === 2
                          ? "bg-gradient-to-r from-cyan-500 to-violet-600"
                          : "bg-transparent"
                      }`}
                    >
                      <Rows3 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* FILTER */}

                  <button className="h-[54px] px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 font-semibold flex items-center gap-3">
                    <SlidersHorizontal className="w-4 h-4" />

                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* CONTENT */}

            <div className="grid lg:grid-cols-[320px_1fr] gap-8">
              {/* SIDEBAR */}

              <aside className="lg:sticky lg:top-24 h-fit">
                <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black">Advanced Filters</h3>

                      <p className="text-gray-400 text-sm mt-1">
                        Customize your search
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Filters />
                  </div>
                </div>
              </aside>

              {/* JOBS */}

              <div
                className={`grid gap-8 ${
                  columns === 3
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {sortedJobs.length > 0 ? (
                  sortedJobs.map((job) => {
                    const isSaved = savedJobs.includes(job._id);

                    const isApplied = appliedJobs.includes(job._id);

                    return (
                      <div
                        key={job._id}
                        className="group relative rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                      >
                        {/* GLOW */}

                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />

                        {/* TOP */}

                        <div className="relative p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-2xl font-black">
                                {job.title?.charAt(0)}
                              </div>

                              <div>
                                <h3 className="text-xl font-bold leading-tight">
                                  {job.title}
                                </h3>

                                <p className="text-gray-400 mt-1">
                                  {job.createdBy?.name || "Company"}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleSave(job._id)}
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                isSaved
                                  ? "bg-yellow-500 text-black"
                                  : "bg-white/5 border border-white/10 hover:bg-white/10"
                              }`}
                            >
                              <Bookmark className="w-5 h-5" />
                            </button>
                          </div>

                          {/* META */}

                          <div className="flex flex-wrap gap-3 mt-8">
                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                              {job.location || "Remote"}
                            </div>

                            {job.jobType?.slice(0, 2).map((type, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm"
                              >
                                {type}
                              </div>
                            ))}
                          </div>

                          {/* DESCRIPTION */}

                          <p className="mt-6 text-gray-400 leading-7 line-clamp-3">
                            {job.description}
                          </p>

                          {/* TAGS */}

                          <div className="flex flex-wrap gap-3 mt-6">
                            {job.tags?.slice(0, 4).map((tag, index) => (
                              <span
                                key={index}
                                className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* FOOTER */}

                          <div className="mt-8 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">
                                Posted Recently
                              </p>

                              <h4 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                                Premium Role
                              </h4>
                            </div>

                            <button
                              onClick={() => applyJob(job._id)}
                              className={`h-[56px] px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                                isApplied
                                  ? "bg-emerald-500 text-black"
                                  : "bg-gradient-to-r from-cyan-500 to-violet-600 hover:scale-[1.03]"
                              }`}
                            >
                              {isApplied ? "Applied" : "Apply Now"}

                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* CUSTOM CARD */}

                        <div className="px-6 pb-6">
                          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                            <JobCard job={job} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full">
                    <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-16 text-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 mx-auto flex items-center justify-center">
                        <Search className="w-10 h-10" />
                      </div>

                      <h3 className="text-4xl font-black mt-8">
                        No Jobs Found
                      </h3>

                      <p className="text-gray-400 mt-4 max-w-xl mx-auto leading-8">
                        Try changing your filters or search keyword to discover
                        more amazing opportunities.
                      </p>

                      <button className="mt-8 h-[58px] px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 font-semibold">
                        Reset Search
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CTA
        ========================================================= */}

        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[50px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-pink-500/10 backdrop-blur-3xl p-12 md:p-20">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[120px]" />

              <div className="relative text-center">
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 bg-white/5 mb-8">
                  <Sparkles className="w-4 h-4 text-yellow-400" />

                  <span className="text-sm text-gray-200">
                    Career Growth Starts Here
                  </span>
                </div>

                <h2 className="text-5xl md:text-7xl font-black leading-tight">
                  Ready For Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">
                    Next Big Move?
                  </span>
                </h2>

                <p className="max-w-3xl mx-auto mt-8 text-lg text-gray-300 leading-8">
                  Join thousands of professionals finding extraordinary careers
                  through our premium platform.
                </p>

                <div className="flex flex-wrap justify-center gap-5 mt-10">
                  <button className="h-[62px] px-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 font-semibold text-lg hover:scale-[1.03] transition-all duration-300">
                    Start Exploring
                  </button>

                  <button className="h-[62px] px-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                    Upload Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
