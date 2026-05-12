"use client";

import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import JobCard from "@/Components/JobItem/JobCard";
import { useGlobalContext } from "@/context/globalContext";
import { supabase } from "@/lib/supabase";
import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

function Page() {
  const { userProfile, isAuthenticated, loading } = useGlobalContext();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [otherJobs, setOtherJobs] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);

  const userId = userProfile?.id;

  // =========================
  // AUTH GUARD
  // =========================
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, loading, router]);

  // =========================
  // FETCH SINGLE JOB
  // =========================
  useEffect(() => {
    const fetchJob = async () => {
      setLoadingJob(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Job fetch error:", error.message);
        toast.error("Failed to fetch job details.");
        setLoadingJob(false);
        return;
      }

      setJob(data);
      setLoadingJob(false);
    };

    if (id) fetchJob();
  }, [id]);

  // =========================
  // FETCH OTHER JOBS
  // =========================
  useEffect(() => {
    const fetchOtherJobs = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .neq("id", id)
        .limit(5);

      setOtherJobs(data || []);
    };

    if (id) fetchOtherJobs();
  }, [id]);

  // =========================
  // CHECK LIKE / APPLY STATUS
  // =========================
  useEffect(() => {
    if (!job || !userId) return;

    setIsLiked(job.likes?.includes(userId));
    setIsApplied(job.applicants?.includes(userId));
  }, [job, userId]);

  // =========================
  // LIKE JOB
  // =========================
  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!userId || !job) return;

    let updatedLikes = job.likes || [];

    if (updatedLikes.includes(userId)) {
      updatedLikes = updatedLikes.filter((id: string) => id !== userId);
    } else {
      updatedLikes.push(userId);
    }

    const { error } = await supabase
      .from("jobs")
      .update({ likes: updatedLikes })
      .eq("id", job.id);

    if (error) {
      toast.error("Failed to update like");
      return;
    }

    setJob({ ...job, likes: updatedLikes });
    setIsLiked(updatedLikes.includes(userId));
  };

  // =========================
  // APPLY JOB
  // =========================
  const applyToJob = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!userId || !job) return;

    if (isApplied) {
      toast.error("Already applied");
      return;
    }

    const updatedApplicants = [...(job.applicants || []), userId];

    const { error } = await supabase
      .from("jobs")
      .update({ applicants: updatedApplicants })
      .eq("id", job.id);

    if (error) {
      toast.error("Failed to apply");
      return;
    }

    setJob({ ...job, applicants: updatedApplicants });
    setIsApplied(true);

    toast.success("Applied successfully");
  };

  // =========================
  // LOADING / AUTH STATE
  // =========================
  if (loading || loadingJob || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Job not found.
      </div>
    );
  }

  const {
    title,
    location,
    description,
    salary,
    job_type,
    created_at,
    company_name,
    company_logo,
  } = job;

  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />

      <div className="p-4 md:p-8 mx-auto w-full md:w-[90%] flex flex-col md:flex-row gap-8">
        {/* LEFT */}
        <div className="md:w-1/4 flex flex-col gap-8">
          <JobCard job={job} />
          {otherJobs.map((j) => (
            <JobCard job={j} key={j.id || j._id} />
          ))}
        </div>

        {/* MAIN */}
        <div className="flex-1 bg-white p-6 rounded-md shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src={company_logo || "/user.png"}
                alt={company_name || "Company"}
                width={45}
                height={45}
                className="rounded-md"
              />
              <div>
                <p className="font-bold">{company_name || "Company"}</p>
                <p className="text-sm text-gray-500">Recruiter</p>
              </div>
            </div>

            <button
              className={`text-2xl ${
                isLiked ? "text-[#7263f3]" : "text-gray-400"
              }`}
              onClick={handleLike}
            >
              {isLiked ? bookmark : bookmarkEmpty}
            </button>
          </div>

          <h1 className="text-2xl font-semibold mt-3">{title}</h1>
          <p className="text-gray-500">{location}</p>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-green-100 rounded-xl text-center">
              Salary <br />
              <b>{formatMoney(salary, "GBP")}</b>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl text-center">
              Posted <br />
              <b>{formatDates(created_at)}</b>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl text-center">
              Applicants <br />
              <b>{job.applicants?.length || 0}</b>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl text-center">
              Type <br />
              <b>{job_type}</b>
            </div>
          </div>

          <h2 className="font-bold text-xl mt-5">Job Description</h2>
          <div
            className="mt-3 prose"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        {/* RIGHT */}
        <div className="md:w-1/4 flex flex-col gap-4">
          <button
            className={`text-white py-4 rounded-full ${
              isApplied
                ? "bg-green-500 cursor-not-allowed"
                : "bg-[#7263f3] hover:bg-[#7263f3]/90"
            }`}
            onClick={applyToJob}
            disabled={isApplied}
          >
            {isApplied ? "Applied" : "Apply Now"}
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default Page;