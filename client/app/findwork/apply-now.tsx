"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { supabase } from "@/lib/supabase";
import { useGlobalContext } from "@/context/globalContext";
import type { Job } from "@/types/types";

export default function ApplyNowPage() {
  const { userProfile } = useGlobalContext();
  const { jobId } = useParams(); // Assuming route is like /apply-now/[jobId]
  const [job, setJob] = useState<Job | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* =======================================================
      FETCH JOB DETAILS
  ======================================================= */
  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setJob({
        _id: data.id,
        title: data.title,
        description: data.description,
        location: data.location,
        salary: data.salary,
        salaryType: data.salary_type,
        negotiable: data.negotiable,
        jobType: data.job_type,
        tags: data.tags,
        skills: data.skills,
        applicants: data.applicants,
        createdBy: data.created_by || { _id: "", profilePicture: "", name: "" },
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
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
        .single();

      setIsApplied(!!data);
    };

    checkApplied();
  }, [userProfile?._id, jobId]);

  /* =======================================================
      HANDLE APPLICATION SUBMISSION
  ======================================================= */
  const handleApply = async () => {
    if (!userProfile?._id || !job) return;
    setLoading(true);

    try {
      // Upload resume if exists
      let resumeUrl = "";
      if (resumeFile) {
        const { data, error } = await supabase.storage
          .from("resumes")
          .upload(`user_${userProfile._id}/${resumeFile.name}`, resumeFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) throw error;
        resumeUrl = data?.path || "";
      }

      // Insert application
      await supabase.from("applied_jobs").insert({
        user_id: userProfile._id,
        job_id: job._id,
        cover_letter: coverLetter,
        resume_url: resumeUrl,
      });

      setIsApplied(true);
      alert("Your application has been submitted!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit application. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-2xl font-bold">Loading job details...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-[#f4efe6] min-h-screen text-[#111]">
      <Header />

      <section className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-5xl font-black">{job.title}</h1>
        <p className="mt-2 text-sm text-black/60">
          {job.createdBy?.name || "Qvonxpert Network"} – {job.location || "Remote"}
        </p>

        <div className="mt-6">
          <h2 className="text-2xl font-bold">Job Description</h2>
          <p className="mt-4 text-base leading-7">{job.description}</p>
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold">Required Skills</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              {job.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-4 py-2 border border-black text-xs uppercase font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 border-t pt-10">
          <h2 className="text-3xl font-black mb-6">Apply Now</h2>

          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Write your cover letter here..."
            className="w-full p-4 border border-black rounded mb-4 min-h-[150px] resize-none"
            disabled={isApplied}
          />

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="mb-4"
            disabled={isApplied}
          />

          <button
            onClick={handleApply}
            disabled={isApplied || loading}
            className={`px-6 py-4 uppercase font-bold tracking-[0.1em] transition ${
              isApplied
                ? "bg-green-500 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-green-500 hover:text-black"
            }`}
          >
            {isApplied ? "Application Sent" : loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
