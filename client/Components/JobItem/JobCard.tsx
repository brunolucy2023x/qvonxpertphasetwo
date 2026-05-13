"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar } from "lucide-react";

import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";

import { Job } from "@/types/types";
import { Separator } from "../ui/separator";

import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";

import { bookmark, bookmarkEmpty } from "@/utils/Icons";

import { supabase } from "@/lib/supabase";

interface JobProps {
  job: Job;
  activeJob?: boolean;
}

function JobCard({ job, activeJob }: JobProps) {
  const router = useRouter();
  const { likeJob } = useJobsContext();
  const { userProfile, isAuthenticated } = useGlobalContext();

  const [isLiked, setIsLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  const userId = userProfile?.auth0_id || userProfile?.id;
  const jobId = job._id;

  const { title, salaryType, salary, createdBy, applicants, jobType, createdAt } = job;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";

  // =========================
  // CHECK LIKE STATUS
  // =========================
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!userId || !jobId || !supabase) return; // ✅ FIX HERE

      const { data, error } = await supabase
        .from("job_likes")
        .select("id")
        .eq("job_id", jobId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Like fetch error:", error.message);
        return;
      }

      setIsLiked(!!data);
    };

    fetchLikeStatus();
  }, [jobId, userId]);

  // =========================
  // LIKE / UNLIKE
  // =========================
  const handleLike = async () => {
    if (!userId || !jobId || loadingLike || !supabase) return; // ✅ FIX HERE

    if (!isAuthenticated) {
      router.push(`${baseUrl}/login?redirect=/job/${jobId}`);
      return;
    }

    try {
      setLoadingLike(true);

      if (isLiked) {
        const { error } = await supabase
          .from("job_likes")
          .delete()
          .eq("job_id", jobId)
          .eq("user_id", userId);

        if (error) throw error;

        setIsLiked(false);
      } else {
        const { error } = await supabase
          .from("job_likes")
          .insert([{ job_id: jobId, user_id: userId }]);

        if (error) throw error;

        setIsLiked(true);
      }

      likeJob?.(jobId);
    } catch (error: any) {
      console.error("Like error:", error.message);
    } finally {
      setLoadingLike(false);
    }
  };

  const companyName = createdBy?.name || "Company";
  const companyImage = createdBy?.profilePicture || "/user.png";

  const companyDescription =
    "Modern job opportunity posted on QvonXpert marketplace.";

  const jobTypeBg = (type: string) => {
    switch (type) {
      case "Full Time":
        return "bg-green-500/20 text-green-600";
      case "Part Time":
        return "bg-purple-500/20 text-purple-600";
      case "Contract":
        return "bg-red-500/20 text-red-600";
      case "Internship":
        return "bg-indigo-500/20 text-indigo-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  return (
    <div
      className={`p-8 rounded-xl flex flex-col gap-5 transition ${
        activeJob ? "bg-gray-50 border-b-2 border-[#7263f3]" : "bg-white"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div
          className="flex gap-3 items-center cursor-pointer"
          onClick={() => router.push(`/job/${jobId}`)}
        >
          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-200">
            <Image src={companyImage} alt={companyName} width={40} height={40} />
          </div>

          <div>
            <h4 className="font-bold text-sm md:text-base">{title}</h4>
            <p className="text-xs text-gray-500">
              {companyName} • {applicants?.length || 0} Applicants
            </p>
          </div>
        </div>

        {/* LIKE BUTTON */}
        <button
          disabled={loadingLike}
          onClick={handleLike}
          className={`text-2xl ${
            isLiked ? "text-[#7263f3]" : "text-gray-400"
          }`}
        >
          {isLiked ? bookmark : bookmarkEmpty}
        </button>
      </div>

      {/* TAGS */}
      <div className="flex gap-2 flex-wrap">
        {jobType?.map((type, i) => (
          <span key={i} className={`px-3 py-1 text-xs rounded ${jobTypeBg(type)}`}>
            {type}
          </span>
        ))}
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-600">{companyDescription}</p>

      <Separator />

      {/* FOOTER */}
      <div className="flex justify-between text-sm">
        <p className="font-bold">
          {formatMoney(salary, "GBP")} /{salaryType}
        </p>

        <p className="flex items-center gap-2 text-gray-400">
          <Calendar size={14} />
          {formatDates(createdAt)}
        </p>
      </div>
    </div>
  );
}

export default JobCard;