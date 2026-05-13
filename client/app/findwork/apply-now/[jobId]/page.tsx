"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { supabase } from "@/lib/supabase";
import { Job } from "@/types/types";
import { ArrowUpRight } from "lucide-react";

export default function ApplyNowPage() {
  const params = useParams();
  const jobId = params?.jobId;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  /* =======================================================
      FETCH JOB BY ID
  ======================================================= */
  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setLoading(true);
      try {
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

        // Type-safe mapping
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
          likes: data.likes || [], // required for TypeScript
          createdBy: data.created_by || { _id: "", name: "", profilePicture: "" },
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString(),
        };

        setJob(mappedJob);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch job data");
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  /* =======================================================
      APPLY TO JOB
  ======================================================= */
  const handleApply = async () => {
    if (!job) return;

    try {
      await supabase.from("applied_jobs").insert({
        user_id: "CURRENT_USER_ID", // replace with logged-in user ID
        job_id: job._id,
      });

      setApplied(true);
    } catch (err) {
      console.error(err);
      setError("Failed to apply for the job");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <p className="text-red-500">{error || "Job not found"}</p>
      </div>
    );
  }

  return (
    <main className="bg-[#f4efe6] text-[#111111] min-h-screen">
      <Header />

      <section className="max-w-[900px] mx-auto px-6 py-12">
        <div className="border border-black bg-white p-10 space-y-6">
          <h1 className="text-5xl font-black">{job.title}</h1>
          <p className="text-sm text-black/60">{job.createdBy.name || "Qvonxpert Network"}</p>

          <div className="flex flex-wrap gap-3 mt-4">
            <span className="border border-black px-4 py-2 text-xs uppercase">{job.location}</span>
            {job.jobType.map((type, i) => (
              <span key={i} className="border border-black px-4 py-2 text-xs uppercase">{type}</span>
            ))}
          </div>

          <div className="mt-6 text-base leading-7 text-black/70">
            <p>{job.description}</p>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {job.tags.map((tag, i) => (
              <span key={i} className="text-xs uppercase border border-black px-4 py-2">{tag}</span>
            ))}
          </div>

          <button
            onClick={handleApply}
            disabled={applied}
            className={`mt-10 h-[64px] w-full border border-black uppercase tracking-[0.2em] text-sm font-black transition flex items-center justify-center gap-3 ${
              applied ? "bg-[#d9ff65] cursor-not-allowed" : "bg-black text-white hover:bg-[#d9ff65] hover:text-black"
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
