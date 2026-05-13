"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/types";
import { ArrowUpRight } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";

export default function ApplyNowPage() {
  const params = useParams();
  const { userProfile } = useGlobalContext();

  const jobId = Array.isArray(params?.jobId)
    ? params.jobId[0]
    : params?.jobId;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  /* =======================================================
      FETCH JOB FROM SUPABASE
  ======================================================= */
  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error || !data) {
        setError("Job not found");
        setLoading(false);
        return;
      }

      const mappedJob: Job = {
        _id: data.id,
        title: data.title || "",
        description: data.description || "",
        location: data.location || "Remote",
        salary: data.salary || 0,
        salaryType: data.salary_type || "Yearly",
        negotiable: data.negotiable || false,
        jobType: data.job_type || [],
        tags: data.tags || [],
        skills: data.skills || [],
        applicants: data.applicants || [],
        likes: data.likes || [], // IMPORTANT (fixes TS build error)
        createdBy: data.created_by || {
          _id: "",
          name: "",
          profilePicture: "",
        },
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };

      setJob(mappedJob);
      setLoading(false);
    };

    fetchJob();
  }, [jobId]);

  /* =======================================================
      CHECK IF USER ALREADY APPLIED
  ======================================================= */
  useEffect(() => {
    if (!userProfile?._id || !jobId) return;

    const checkApplied = async () => {
      const { data } = await supabase
        .from("applied_jobs")
        .select("job_id")
        .eq("user_id", userProfile._id)
        .eq("job_id", jobId)
        .maybeSingle();

      setApplied(!!data);
    };

    checkApplied();
  }, [userProfile?._id, jobId]);

  /* =======================================================
      APPLY TO JOB
  ======================================================= */
  const handleApply = async () => {
    if (!userProfile?._id || !job) return;

    const { error } = await supabase.from("applied_jobs").insert({
      user_id: userProfile._id,
      job_id: job._id,
    });

    if (!error) {
      setApplied(true);
    } else {
      console.error(error);
      setError("Failed to apply for this job");
    }
  };

  /* =======================================================
      LOADING STATE
  ======================================================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-bold">Loading job...</p>
      </div>
    );
  }

  /* =======================================================
      ERROR STATE
  ======================================================= */
  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <p className="text-red-500 font-bold">
          {error || "Job not found"}
        </p>
      </div>
    );
  }

  /* =======================================================
      MAIN UI
  ======================================================= */
  return (
    <main className="bg-[#f4efe6] text-[#111] min-h-screen">
      <Header />

      <section className="max-w-[900px] mx-auto px-6 py-12">
        <div className="border border-black bg-white p-10 space-y-6">
          
          {/* TITLE */}
          <h1 className="text-5xl font-black">{job.title}</h1>

          {/* COMPANY */}
          <p className="text-sm text-black/60">
            {job.createdBy?.name || "Qvonxpert Network"}
          </p>

          {/* META */}
          <div className="flex flex-wrap gap-3">
            <span className="border border-black px-4 py-2 text-xs uppercase">
              {job.location}
            </span>

            {job.jobType?.map((t, i) => (
              <span
                key={i}
                className="border border-black px-4 py-2 text-xs uppercase"
              >
                {t}
              </span>
            ))}
          </div>

          {/* DESCRIPTION */}
          <p className="text-black/70 leading-7">
            {job.description}
          </p>

          {/* SKILLS */}
          <div className="flex flex-wrap gap-3">
            {job.skills?.map((skill, i) => (
              <span
                key={i}
                className="border border-black px-4 py-2 text-xs uppercase"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* APPLY BUTTON */}
          <button
            onClick={handleApply}
            disabled={applied}
            className={`mt-10 h-[64px] w-full border border-black uppercase tracking-[0.2em] text-sm font-black flex items-center justify-center gap-3 transition ${
              applied
                ? "bg-[#d9ff65] cursor-not-allowed"
                : "bg-black text-white hover:bg-[#d9ff65] hover:text-black"
            }`}
          >
            {applied ? "Application Sent" : "Apply Now"}
            <ArrowUpRight size={18} />
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
