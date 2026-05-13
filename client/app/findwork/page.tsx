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
  Bookmark,
  ArrowUpRight,
  Briefcase,
  Clock3,
  Sparkles,
  Plus,
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

      if (error) return;

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
    <main className="bg-[#f4efe6] text-[#111111] min-h-screen">
      <Header />

      {/* =======================================================
          HERO
      ======================================================= */}

      <section className="border-b border-black">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] border border-black">
            {/* LEFT */}

            <div className="p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-black">
              <div className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase font-bold">
                <Sparkles size={14} />
                Qvonxpert Careers
              </div>

              <h1 className="mt-8 text-6xl md:text-8xl font-black leading-[0.9] tracking-[-0.05em] uppercase">
                Build
                <br />
                Your Future
              </h1>

              <p className="mt-8 text-lg leading-9 max-w-2xl text-black/70">
                Discover premium career opportunities at Qvonxpert and connect
                with innovative companies shaping the future of technology,
                design, business, and digital transformation.
              </p>

              {/* SEARCH */}

              <div className="mt-12 border border-black bg-white">
                <div className="grid md:grid-cols-4">
                  <div className="border-b md:border-b-0 md:border-r border-black h-[78px] px-6 flex items-center gap-4">
                    <Search size={18} />

                    <input
                      type="text"
                      placeholder="Search roles"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent outline-none font-medium"
                    />
                  </div>

                  <div className="border-b md:border-b-0 md:border-r border-black h-[78px] px-6 flex items-center gap-4">
                    <MapPin size={18} />

                    <input
                      type="text"
                      placeholder="Search location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-transparent outline-none font-medium"
                    />
                  </div>

                  <div className="border-b md:border-b-0 md:border-r border-black h-[78px] px-6 flex items-center gap-4">
                    <Briefcase size={18} />

                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-transparent outline-none font-medium"
                    >
                      <option value="All">All Roles</option>
                      <option value="Remote">Remote</option>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <button className="h-[78px] bg-black text-white text-sm uppercase tracking-[0.2em] font-bold hover:bg-[#222] transition">
                    Explore Careers
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="bg-[#d9ff65] p-10 lg:p-16 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-bold">
                  Qvonxpert Insights
                </p>

                <div className="mt-10 space-y-10">
                  <div>
                    <h2 className="text-6xl font-black">14K+</h2>
                    <p className="mt-2 text-sm uppercase tracking-[0.2em]">
                      Career Opportunities
                    </p>
                  </div>

                  <div>
                    <h2 className="text-6xl font-black">1.2K</h2>
                    <p className="mt-2 text-sm uppercase tracking-[0.2em]">
                      Trusted Employers
                    </p>
                  </div>

                  <div>
                    <h2 className="text-6xl font-black">92%</h2>
                    <p className="mt-2 text-sm uppercase tracking-[0.2em]">
                      Flexible & Remote Roles
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-14 border-t border-black pt-8">
                <p className="text-sm leading-8 uppercase tracking-[0.2em]">
                  Qvonxpert connects ambitious professionals with world-class
                  opportunities across tech, marketing, finance, design, and
                  innovation-driven industries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          BODY
      ======================================================= */}

      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          {/* SIDEBAR */}

          <aside>
            <div className="border border-black bg-white sticky top-24">
              <div className="border-b border-black p-6 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase">
                  Career Filters
                </h3>

                <Plus size={18} />
              </div>

              <div className="p-6">
                <Filters />
              </div>
            </div>
          </aside>

          {/* CONTENT */}

          <div>
            {/* TOP */}

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-black pb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-bold">
                  Latest Openings
                </p>

                <h2 className="mt-4 text-5xl font-black uppercase leading-none">
                  Qvonxpert Opportunities
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="border border-black bg-white h-[58px] px-6 flex items-center gap-3 uppercase text-sm font-bold">
                  <Clock3 size={16} />
                  Recently Added
                </div>

                <div className="border border-black bg-black text-white h-[58px] px-8 flex items-center uppercase text-sm tracking-[0.2em] font-bold">
                  {filteredJobs.length} Open Roles
                </div>
              </div>
            </div>

            {/* JOB LIST */}

            <div className="mt-10 space-y-8">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => {
                  const isSaved = savedJobs.includes(job._id);
                  const isApplied = appliedJobs.includes(job._id);

                  return (
                    <div
                      key={job._id}
                      className={`border border-black ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-[#efe7da]"
                      }`}
                    >
                      <div className="grid lg:grid-cols-[220px_1fr_220px]">
                        {/* LEFT */}

                        <div className="border-b lg:border-b-0 lg:border-r border-black p-8 flex flex-col justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] font-bold">
                              Employer
                            </p>

                            <div className="mt-6 w-16 h-16 border border-black flex items-center justify-center text-2xl font-black">
                              {job.title?.charAt(0)}
                            </div>
                          </div>

                          <button
                            onClick={() => toggleSave(job._id)}
                            className={`mt-10 h-[52px] border border-black flex items-center justify-center gap-2 uppercase text-xs tracking-[0.2em] font-bold transition ${
                              isSaved
                                ? "bg-black text-white"
                                : "bg-transparent hover:bg-black hover:text-white"
                            }`}
                          >
                            <Bookmark size={16} />
                            Save Role
                          </button>
                        </div>

                        {/* CENTER */}

                        <div className="p-8 border-b lg:border-b-0 lg:border-r border-black">
                          <div className="flex flex-wrap gap-3">
                            <span className="border border-black px-4 py-2 text-xs uppercase tracking-[0.2em] font-bold">
                              {job.location || "Remote"}
                            </span>

                            {job.jobType?.slice(0, 2).map((item, i) => (
                              <span
                                key={i}
                                className="border border-black px-4 py-2 text-xs uppercase tracking-[0.2em] font-bold"
                              >
                                {item}
                              </span>
                            ))}
                          </div>

                          <h3 className="mt-8 text-4xl font-black uppercase leading-tight">
                            {job.title}
                          </h3>

                          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-black/60">
                            {job.createdBy?.name || "Qvonxpert Network"}
                          </p>

                          <p className="mt-8 text-base leading-9 text-black/70 max-w-3xl">
                            {job.description}
                          </p>

                          {/* TAGS */}

                          <div className="flex flex-wrap gap-3 mt-10">
                            {job.tags?.slice(0, 5).map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs uppercase tracking-[0.15em] border border-black px-4 py-2"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-10">
                            <JobCard job={job} />
                          </div>
                        </div>

                        {/* RIGHT */}

                        <div className="p-8 flex flex-col justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] font-bold">
                              Start Your Journey
                            </p>

                            <h4 className="mt-6 text-5xl font-black">
                              →
                            </h4>
                          </div>

                          <button
                            onClick={() => applyJob(job._id)}
                            className={`h-[64px] w-full border border-black uppercase tracking-[0.2em] text-sm font-black transition flex items-center justify-center gap-3 ${
                              isApplied
                                ? "bg-[#d9ff65]"
                                : "bg-black text-white hover:bg-[#d9ff65] hover:text-black"
                            }`}
                          >
                            {isApplied ? "Application Sent" : "Apply Now"}

                            <ArrowUpRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border border-black bg-white p-20 text-center">
                  <h3 className="text-6xl font-black uppercase">
                    No Opportunities Found
                  </h3>

                  <p className="mt-6 uppercase tracking-[0.2em] text-sm text-black/60">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
