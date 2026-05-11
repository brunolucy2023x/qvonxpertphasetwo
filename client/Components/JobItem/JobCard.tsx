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

  const { userProfile, isAuthenticated } =
    useGlobalContext();

  const [isLiked, setIsLiked] = useState(false);

  const [loadingLike, setLoadingLike] =
    useState(false);

  const userId = userProfile?._id;

  const {
    title,
    salaryType,
    salary,
    createdBy,
    applicants,
    jobType,
    createdAt,
  } = job;

  const { name, profilePicture } = createdBy || {};

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "https://qvonxpert.com";

  /**
   * CHECK IF USER ALREADY LIKED JOB
   * SUPABASE ONLY
   * DOES NOT TOUCH MONGODB
   */
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!userId || !job?._id) return;

      try {
        const { data, error } = await supabase
          .from("job_likes")
          .select("id")
          .eq("job_id", job._id)
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error(
            "Supabase fetch like error:",
            error
          );

          return;
        }

        setIsLiked(!!data);
      } catch (error) {
        console.error("Like status error:", error);
      }
    };

    fetchLikeStatus();
  }, [job?._id, userId]);

  /**
   * HANDLE LIKE / UNLIKE
   * SUPABASE + EXISTING DATABASE
   */
  const handleLike = async (jobId: string) => {
    if (!userId || loadingLike) return;

    try {
      setLoadingLike(true);

      if (isLiked) {
        /**
         * REMOVE LIKE FROM SUPABASE
         */
        const { error } = await supabase
          .from("job_likes")
          .delete()
          .eq("job_id", jobId)
          .eq("user_id", userId);

        if (error) {
          console.error(
            "Supabase unlike error:",
            error
          );

          return;
        }

        setIsLiked(false);
      } else {
        /**
         * ADD LIKE TO SUPABASE
         */
        const { error } = await supabase
          .from("job_likes")
          .insert([
            {
              job_id: jobId,
              user_id: userId,
            },
          ]);

        if (error) {
          console.error(
            "Supabase like error:",
            error
          );

          return;
        }

        setIsLiked(true);
      }

      /**
       * KEEP EXISTING MONGODB FUNCTIONALITY
       * DOES NOT INTERFERE WITH CURRENT DATABASE
       */
      likeJob(jobId);
    } catch (error) {
      console.error("Handle like error:", error);
    } finally {
      setLoadingLike(false);
    }
  };

  const companyDescription =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget nunc.";

  /**
   * JOB TYPE STYLES
   */
  const jobTypeBg = (type: string) => {
    switch (type) {
      case "Full Time":
        return "bg-green-500/20 text-green-600 border-green-500/20";

      case "Part Time":
        return "bg-purple-500/20 text-purple-600 border-purple-500/20";

      case "Contract":
        return "bg-red-500/20 text-red-600 border-red-500/20";

      case "Internship":
        return "bg-indigo-500/20 text-indigo-600 border-indigo-500/20";

      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div
      className={`p-8 rounded-xl flex flex-col gap-5 transition-all duration-300 ${
        activeJob
          ? "bg-gray-50 shadow-md border-b-2 border-[#7263f3]"
          : "bg-white"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">
        <div
          className="group flex gap-3 items-center cursor-pointer"
          onClick={() => router.push(`/job/${job._id}`)}
        >
          {/* COMPANY IMAGE */}
          <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
            <Image
              src={profilePicture || "/user.png"}
              alt={name || "Company"}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
          </div>

          {/* JOB INFO */}
          <div className="flex flex-col gap-1">
            <h4 className="group-hover:underline font-bold text-sm md:text-base">
              {title}
            </h4>

            <p className="text-xs text-gray-500">
              {name || "Company"} •{" "}
              {applicants?.length || 0}{" "}
              {applicants?.length === 1
                ? "Applicant"
                : "Applicants"}
            </p>
          </div>
        </div>

        {/* LIKE BUTTON */}
        <button
          type="button"
          disabled={loadingLike}
          className={`text-2xl transition-all duration-200 ${
            isLiked
              ? "text-[#7263f3]"
              : "text-gray-400 hover:text-[#7263f3]"
          } ${
            loadingLike
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={() => {
            if (!isAuthenticated) {
              router.push(`${baseUrl}/login`);
              return;
            }

            handleLike(job._id);
          }}
        >
          {isLiked ? bookmark : bookmarkEmpty}
        </button>
      </div>

      {/* TAGS */}
      <div className="flex items-center gap-2 flex-wrap">
        {jobType?.map((type, index) => (
          <span
            key={index}
            className={`py-1 px-3 text-xs font-medium rounded-md border ${jobTypeBg(
              type
            )}`}
          >
            {type}
          </span>
        ))}
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {companyDescription.length > 100
          ? `${companyDescription.substring(
              0,
              100
            )}...`
          : companyDescription}
      </p>

      <Separator />

      {/* FOOTER */}
      <div className="flex justify-between items-center gap-6 flex-wrap">
        {/* SALARY */}
        <p>
          <span className="font-bold text-base">
            {formatMoney(salary, "GBP")}
          </span>

          <span className="font-medium text-gray-400 text-lg">
            /
            {salaryType === "Yearly"
              ? "pa"
              : salaryType === "Monthly"
              ? "pcm"
              : salaryType === "Weekly"
              ? "pw"
              : "ph"}
          </span>
        </p>

        {/* DATE */}
        <p className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={16} />

          Posted: {formatDates(createdAt)}
        </p>
      </div>
    </div>
  );
}

export default JobCard;