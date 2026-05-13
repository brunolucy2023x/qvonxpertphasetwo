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
  Bookmark,
  Clock3,
  ChevronDown,
  SlidersHorizontal,
  ArrowRight,
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
     SEARCH DEBOUNCE
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
     FILTER JOBS
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
     SORT JOBS
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
    <main className="min-h-screen bg-[#f5f7fb] text-gray-900">
      <Header />

      {/* =========================================================
          HERO SECTION
      ========================================================= */}

      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 py-14">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-2 rounded-full">
              <Briefcase size={16} />
              Find Better Opportunities
            </span>

            <h1 className="mt-6 text-4xl md:text-5xl font-bold leading-tight text-gray-900">
              Discover Your Next Career Move
            </h1>

            <p className="mt-5 text-gray-600 text-base leading-7">
              Browse top opportunities from leading companies and apply with a
              modern streamlined experience.
            </p>

            {/* SEARCH BAR */}

            <div className="mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* SEARCH */}

                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 h-[54px]">
                  <Search size={18} className="text-gray-400" />

                  <input
                    type="text"
                    placeholder="Search jobs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>

                {/* LOCATION */}

                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 h-[54px]">
                  <MapPin size={18} className="text-gray-400" />

                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>

                {/* TYPE */}

                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 h-[54px]">
                  <Briefcase size={18} className="text-gray-400" />

                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                  >
                    <option value="All">All Types</option>
                    <option value="Remote">Remote</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* BUTTON */}

                <button className="h-[54px] rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white text-sm font-medium">
                  Search Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN SECTION
      ========================================================= */}

      <section className="max-w-7xl mx-auto px-5 py-10">
        {/* TOP BAR */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          {/* LEFT */}

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Available Jobs
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {sortedJobs.length} opportunities available
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex flex-wrap items-center gap-3">
            {/* SORT */}

            <div className="flex items-center gap-2 border border-gray-200 bg-white px-4 h-[48px] rounded-xl">
              <Clock3 size={16} className="text-gray-400" />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="outline-none bg-transparent text-sm"
              >
                <option value="newest">Newest</option>
                <option value="relevant">Relevant</option>
              </select>

              <ChevronDown size={16} className="text-gray-400" />
            </div>

            {/* GRID TOGGLE */}

            <div className="flex items-center border border-gray-200 bg-white rounded-xl overflow-hidden">
              <button
                onClick={() => setColumns(3)}
                className={`w-12 h-12 flex items-center justify-center ${
                  columns === 3
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600"
                }`}
              >
                <LayoutGrid size={18} />
              </button>

              <button
                onClick={() => setColumns(2)}
                className={`w-12 h-12 flex items-center justify-center ${
                  columns === 2
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600"
                }`}
              >
                <Rows3 size={18} />
              </button>
            </div>

            {/* FILTER BUTTON */}

            <button className="h-[48px] px-5 rounded-xl border border-gray-200 bg-white flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition">
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* SIDEBAR */}

          <aside>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>

                <SlidersHorizontal size={18} className="text-gray-500" />
              </div>

              <Filters />
            </div>
          </aside>

          {/* JOB LIST */}

          <div
            className={`grid gap-6 ${
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
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition duration-300"
                  >
                    {/* HEADER */}

                    <div className="p-5 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          {/* AVATAR */}

                          <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-lg shrink-0">
                            {job.title?.charAt(0)}
                          </div>

                          {/* TITLE */}

                          <div>
                            <h3 className="font-semibold text-base text-gray-900 leading-6">
                              {job.title}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                              {job.createdBy?.name || "Company"}
                            </p>

                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                {job.location || "Remote"}
                              </span>

                              {job.jobType?.slice(0, 2).map((type, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* SAVE */}

                        <button
                          onClick={() => toggleSave(job._id)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                            isSaved
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          <Bookmark size={18} />
                        </button>
                      </div>
                    </div>

                    {/* BODY */}

                    <div className="p-5">
                      <p className="text-sm text-gray-600 leading-7 line-clamp-3">
                        {job.description}
                      </p>

                      {/* TAGS */}

                      <div className="flex flex-wrap gap-2 mt-5">
                        {job.tags?.slice(0, 4).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* CUSTOM COMPONENT */}

                      <div className="mt-5">
                        <JobCard job={job} />
                      </div>

                      {/* FOOTER */}

                      <div className="mt-6 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-gray-400">
                            Recently Posted
                          </p>

                          <p className="text-sm font-medium text-gray-800 mt-1">
                            Apply Today
                          </p>
                        </div>

                        <button
                          onClick={() => applyJob(job._id)}
                          className={`h-[44px] px-5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                            isApplied
                              ? "bg-green-100 text-green-700"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          {isApplied ? "Applied" : "Apply"}

                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-16 text-center">
                <Search
                  size={50}
                  className="mx-auto text-gray-300 mb-5"
                />

                <h3 className="text-2xl font-semibold text-gray-800">
                  No Jobs Found
                </h3>

                <p className="text-gray-500 mt-3 text-sm">
                  Try adjusting your search filters.
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
