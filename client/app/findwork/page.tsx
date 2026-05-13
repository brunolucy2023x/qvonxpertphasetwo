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
  X,
} from "lucide-react";

/* =======================================================
   MODAL COMPONENT
======================================================= */
const AppliedJobsModal = ({
  jobs,
  onClose,
}: {
  jobs: Job[];
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-y-auto p-8 relative border border-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 border border-black rounded-full"
        >
          <X size={18} />
        </button>
        <h2 className="text-3xl font-black mb-6 uppercase">
          Applied Jobs Summary
        </h2>
        {jobs.length === 0 ? (
          <p>No jobs applied yet.</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job._id}
              className="border border-black p-6 mb-6 bg-[#f9f9f9]"
            >
              <h3 className="text-2xl font-bold">{job.title}</h3>
              <p className="text-sm text-black/60 mt-1">
                Company: {job.createdBy?.name || "Qvonxpert Network"}
              </p>
              <p className="mt-2 text-base text-black/70">{job.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="border px-2 py-1 text-xs uppercase font-bold">
                  {job.location || "Remote"}
                </span>
                {job.jobType?.map((type, i) => (
                  <span
                    key={i}
                    className="border px-2 py-1 text-xs uppercase font-bold"
                  >
                    {type}
                  </span>
                ))}
              </div>
              {job.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="border px-2 py-1 text-xs uppercase font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function Page() {
  const { userProfile } = useGlobalContext();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("All");

  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal state
  const [showAppliedModal, setShowAppliedModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

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
        createdBy: job.created_by || { _id: "", profilePicture: "", name: "" },
        createdAt: job.created_at || new Date().toISOString(),
        updatedAt: job.updated_at || new Date().toISOString(),
      }));

      setJobs(mappedJobs);
    };

    fetchJobs();
  }, []);

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

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const keyword = debouncedSearch.toLowerCase();

      const matchesKeyword =
        job.title?.toLowerCase().includes(keyword) ||
        job.createdBy?.name?.toLowerCase().includes(keyword) ||
        job.tags?.some((tag) => tag.toLowerCase().includes(keyword));

      const matchesLocation =
        !location || job.location?.toLowerCase().includes(location.toLowerCase());

      const matchesType = type === "All" || !type || job.jobType?.includes(type);

      return matchesKeyword && matchesLocation && matchesType;
    });
  }, [jobs, debouncedSearch, location, type]);

  // Jobs that the user applied for
  const appliedJobsDetails = jobs.filter((job) => appliedJobs.includes(job._id));

  return (
    <main className="bg-[#f4efe6] text-[#111111] min-h-screen">
      <Header />

      {/* HERO + BODY content stays unchanged */}

      {/* JOB LIST */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          <aside>
            <div className="border border-black bg-white sticky top-24">
              <div className="border-b border-black p-6 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase">Career Filters</h3>
                <Plus size={18} />
              </div>
              <div className="p-6">
                <Filters />
              </div>
            </div>
          </aside>

          <div>
            <div className="flex justify-between mb-6">
              <h2 className="text-3xl font-black uppercase">Qvonxpert Opportunities</h2>
              <button
                onClick={() => setShowAppliedModal(true)}
                className="px-6 py-3 bg-black text-white uppercase text-sm font-bold border border-black hover:bg-[#222] transition"
              >
                View Applied Jobs
              </button>
            </div>

            <div className="space-y-8">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => {
                  const isSaved = savedJobs.includes(job._id);
                  const isApplied = appliedJobs.includes(job._id);

                  return (
                    <div
                      key={job._id}
                      className={`border border-black ${
                        index % 2 === 0 ? "bg-white" : "bg-[#efe7da]"
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
                          <h3 className="mt-8 text-4xl font-black uppercase leading-tight">{job.title}</h3>
                          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-black/60">
                            {job.createdBy?.name || "Qvonxpert Network"}
                          </p>
                          <p className="mt-8 text-base leading-9 text-black/70 max-w-3xl">{job.description}</p>
                          <div className="flex flex-wrap gap-3 mt-10">
                            {job.tags?.slice(0, 5).map((tag, i) => (
                              <span key={i} className="text-xs uppercase tracking-[0.15em] border border-black px-4 py-2">{tag}</span>
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
                            <h4 className="mt-6 text-5xl font-black">→</h4>
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
                  <h3 className="text-6xl font-black uppercase">No Opportunities Found</h3>
                  <p className="mt-6 uppercase tracking-[0.2em] text-sm text-black/60">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showAppliedModal && (
        <AppliedJobsModal
          jobs={appliedJobsDetails}
          onClose={() => setShowAppliedModal(false)}
        />
      )}

      <Footer />
    </main>
  );
}
