"use client";

import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Separator } from "../ui/separator";
import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

interface JobProps {
  job: Job;
  activeJob?: boolean;
}

function JobCard({ job, activeJob }: JobProps) {
  const { likeJob } = useJobsContext();
  const { userProfile, isAuthenticated } = useGlobalContext();

  const router = useRouter();

  const [isLiked, setIsLiked] = React.useState(false);

  const userId = userProfile?._id;

  const {
    title,
    salaryType,
    salary,
    createdBy,
    applicants,
    jobType,
    createdAt,
    likes,
  } = job;

  const { name, profilePicture } = createdBy || {};

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "https://qvonxpert.com";

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  useEffect(() => {
    if (likes && userId) {
      setIsLiked(likes.includes(userId));
    }
  }, [likes, userId]);

  const companyDescription =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget nunc.";

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
      className={`p-8 rounded-xl flex flex-col gap-5 ${
        activeJob
          ? "bg-gray-50 shadow-md border-b-2 border-[#7263f3]"
          : "bg-white"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between">
        <div
          className="group flex gap-1 items-center cursor-pointer"
          onClick={() => router.push(`/job/${job._id}`)}
        >
          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
            <Image
              src={profilePicture || "/user.png"}
              alt={name || "User"}
              width={40}
              height={40}
              className="rounded-md"
            />
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="group-hover:underline font-bold">
              {title}
            </h4>

            <p className="text-xs">
              {name || "Company"}: {applicants?.length || 0}{" "}
              {applicants?.length > 1 ? "Applicants" : "Applicant"}
            </p>
          </div>
        </div>

        {/* LIKE BUTTON */}
        <button
          className={`text-2xl ${
            isLiked ? "text-[#7263f3]" : "text-gray-400"
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
      <div className="flex items-center gap-2">
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
      <p>
        {companyDescription.length > 100
          ? `${companyDescription.substring(0, 100)}...`
          : companyDescription}
      </p>

      <Separator />

      {/* FOOTER */}
      <div className="flex justify-between items-center gap-6">
        <p>
          <span className="font-bold">
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

        <p className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={16} />
          Posted: {formatDates(createdAt)}
        </p>
      </div>
    </div>
  );
}

export default JobCard;